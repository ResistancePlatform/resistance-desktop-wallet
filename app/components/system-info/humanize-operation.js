/**
 * Returns human readable name for the given operation.
 *
 */
export default function humanizeOperationName(operation) {
  switch (operation.method) {
    case 'z_sendmany':
        return `Send cash`
    case 'z_mergetoaddress':
        return `Merge coins`
    case 'z_shieldcoinbase':
        return `Merge all mined coins`
    default:
  }
  return operation.method
}

