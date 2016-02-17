/**
 * Force the given function to be inlined (if natives syntax is enabled).
 */
export const forceInline = (() => {
  try {
    return new Function('target', `
      %SetForceInlineFlag(target);
      return target;
    `);
  }
  catch (e) {
    return input => input;
  }
})();