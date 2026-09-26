module.exports = (html) => {
  const styles = html.match(/\.([^{]+)\s*\{([^}]*)\}/g);
  const stylesData = {};

  styles.forEach((styleString) => {
    const name = styleString.replace(/^\.|{[\s\S]*}$/g, "");
    stylesData[name] = {};

    const props = styleString
      .replace(/\.([^{]+)\s*{([\s\S]*)}/g, "$2")
      .split(";")
      .filter((prop) => prop.length);
    props.forEach((prop) => {
      const [propName, propValue] = prop.split(":");
      stylesData[name][propName] = propValue;
    });
  });

  return stylesData;
};
