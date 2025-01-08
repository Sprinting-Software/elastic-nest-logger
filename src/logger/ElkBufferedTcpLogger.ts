import { Injectable, OnApplicationShutdown } from "@nestjs/common"
import { ElkRestApi } from "./ElkRestApi"
import { LogMessage } from "./types"
import { RawLogger } from "./RawLogger"

@Injectable()
export class ElkBufferedTcpLogger implements OnApplicationShutdown {
  private buffer: LogMessage[] = []

  private isRunning = false
  private scheduler: NodeJS.Timeout | null = null

  constructor(private readonly elkApi: ElkRestApi, private interval = 5000) {
    if (!elkApi) {
      throw new Error("ElkApi instance is required")
    }
  }

  sendObject(log: any): void {
    if (!log) {
      RawLogger.debug("Attempted to log undefined")
      return
    }
    if (this.isRunning) {
      this.buffer.push(log)
    } else {
      RawLogger.debug("You must first call start(). Logs discarded.", log)
    }
  }

  public start(): void {
    const processLogs = async () => {
      if (this.buffer.length > 0) {
        const logsToSend = [...this.buffer]
        this.buffer = [] // Clear the buffer immediately

        try {
          await this.elkApi.sendManyDocuments(logsToSend)
          RawLogger.debug(`Successfully flushed ${logsToSend.length} logs.`)
        } catch (error) {
          RawLogger.debug("Failed to flush logs to ELK", error)
          this.buffer.unshift(...logsToSend) // Re-add logs for retry
        }
      }

      if (this.scheduler) {
        this.scheduler = setTimeout(processLogs, this.interval) // Schedule next execution
      }
    }
    this.isRunning = true
    this.scheduler = setTimeout(processLogs, this.interval)
  }

  private stop() {
    this.isRunning = false
    if (this.scheduler) {
      clearTimeout(this.scheduler)
      this.scheduler = null
    }
  }

  public async flushAndStop() {
    this.stop()
    await this.flush()
  }

  public async flush() {
    if (this.buffer.length === 0) {
      return
    }

    const logsToSend = [...this.buffer]
    this.buffer = []
    try {
      await this.elkApi.sendManyDocuments(logsToSend)
    } catch (error) {
      RawLogger.debug("Failed to flush remaining logs:", error)
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.flushAndStop()
  }
}
