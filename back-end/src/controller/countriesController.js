const getPaises = async (req, res) => {
  try {
    let todosLosPaises = [];
    let offset = 0;
    const limit = 100;
    let hayMas = true;

    while (hayMas) {
      const response = await fetch(
        `https://api.restcountries.com/countries/v5?limit=${limit}&offset=${offset}&response_fields=names.common,names.translations`,
        {
          headers: {
            Authorization: `Bearer ${process.env.RESTCOUNTRIES_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const json = await response.json();
      todosLosPaises = [...todosLosPaises, ...json.data.objects];

      hayMas = json.data.meta.more;
      offset += limit;
    }

    const listaPaises = todosLosPaises
      .map(
        (country) =>
          country.names?.translations?.spa?.common || country.names?.common
      )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'es'));

    res.json(listaPaises);
  } catch (error) {
    console.error('Error al obtener países:', error);
    res.status(500).json({ message: 'Error al obtener la lista de países' });
  }
};

module.exports = { getPaises };