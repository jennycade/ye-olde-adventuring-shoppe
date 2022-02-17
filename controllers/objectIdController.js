exports.isValidObjectId = (str) => {
  const objIdPattern = /^[a-f\d]{24}$/i;
  return objIdPattern.test(str);
}