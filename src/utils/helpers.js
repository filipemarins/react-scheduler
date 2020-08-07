export function notify(handler, args) {
  handler && handler.apply(null, [].concat(args));
}
