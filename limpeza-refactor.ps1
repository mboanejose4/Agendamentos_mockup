# Limpeza depois da reorganizacao do MarcaFacil.
# Remove a estrutura antiga, que deixou de ser importada por alguma coisa.
# Corra a partir da raiz do repositorio, com o servidor de desenvolvimento parado.

Set-Location "C:\Users\josem\OneDrive\Documents\GitHub\Agendamentos_mockup"

# Pastas antigas (substituidas por components/, views/, composables/, stores/, services/, utils/, layouts/)
Remove-Item -Recurse -Force src\API, src\Component, src\Composable, src\Layout, src\Page, src\Store, src\core, src\legacy -ErrorAction SilentlyContinue

# Ficheiros antigos soltos
Remove-Item -Force src\main.js, vite.config.js, tests\unit\applicationStore.test.js -ErrorAction SilentlyContinue

# O Windows nao distingue Utils de utils: as duas pastas sao a mesma e ficaram
# com os ficheiros .js antigos ao lado dos .ts novos. Removem-se os .js.
Remove-Item -Force src\utils\formatters.js, src\utils\theme.js, src\utils\resourceTypes.js -ErrorAction SilentlyContinue
Remove-Item -Force src\utils\navigation\navigationGroups.js, src\utils\navigation\workspaceRoles.js -ErrorAction SilentlyContinue

Write-Host "Limpeza concluida. A seguir: npm install; npm run dev; npm run typecheck"
