# Puesta en marcha de la actualización automática

1. **Clave de API:** en GitHub → Settings → Secrets and variables → Actions → New repository secret. Nombre: `APIFOOTBALL_KEY`. Valor: la clave de API-Football (no la pegues en el chat ni en el código).
2. **IDs de liga:** en `scripts/update-data.mjs` están los IDs de API-Football (Liga Profesional 128, Premier 39, La Liga 140, Serie A 135, Bundesliga 78, Champions 2). Verificalos con `GET /leagues?search=...` antes de la primera corrida.
3. **Temporada:** por defecto usa el año en curso. Si el Clausura figura con otra temporada en la API, usá la variable `SEASON`.
4. **Primera corrida:** en la pestaña Actions, ejecutá "Actualizar datos de La Última Jugada" con *Run workflow*. Revisá el log: debe decir `OK <fecha>: N partidos, consultas: M`.
5. **Cuota:** el plan gratuito permite 100 consultas por día. Cada corrida usa 1 (partidos) + goleadores de partidos en vivo o terminados + tablas solo a las 00:00, 03:00 y 12:00 UTC. El script corta a 90 consultas.
6. **Límites conocidos:** el refresco de ESPN de la página también escribe "Hoy". Si ves partidos que cambian entre ambas fuentes, conviene desactivar uno de los dos.
