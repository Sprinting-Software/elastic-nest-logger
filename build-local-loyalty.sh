 version=$(grep '"version"' package.json | awk -F '"' '{print $4}')
 tsc --emitDecoratorMetadata && npm pack && cd ../loyalty/LoyaltyBE && npm install ../../sprinting-retail-common/sprinting-retail-common-${version}.tgz