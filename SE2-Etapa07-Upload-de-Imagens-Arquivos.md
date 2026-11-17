# SE2 — Etapa 07 — Upload de imagens e arquivos

## Objetivo

Estender o sistema da Etapa 06 para enviar, armazenar e exibir imagens usando a
API da equipe. Implemente dois casos: a foto do usuário autenticado e várias
imagens associadas à entidade principal (`tasks`, em relação **1:N** com
`task_images`): uma tarefa pode ter nenhuma, uma ou várias imagens, e cada
imagem pertence a uma única tarefa.

Consulte as rotas, os controllers, os models e os exemplos do frontend já
existentes antes de implementar. A classe de suporte para gravar uploads já
está disponível em `api/source/Support/Upload.php`; use-a nas soluções PHP em
vez de implementar novamente o recebimento e a validação do arquivo.

## Parte A — Foto do usuário autenticado

- Rota: `POST /users/photo` (`FormData` com campo `photo`)
- Rota de leitura do perfil: `GET /users/me`
- Rota de atualização cadastral: `PUT /users/update`
- Armazenamento físico: `uploads/users/` via `Source\Support\Upload`
- Substituição segura: remove a foto anterior somente após persistir a nova no banco.

## Parte B — Galeria de imagens da tarefa (relação 1:N)

- Tabela filha: `task_images` com chave estrangeira `task_id` referenciando `tasks(id)` (`ON DELETE CASCADE ON UPDATE CASCADE`).
- Rotas:
  - `GET /tasks/:taskId/images` — Lista imagens da tarefa
  - `POST /tasks/:taskId/images` — Envia uma ou mais imagens (`FormData` com `images[]` ou `image`)
  - `DELETE /tasks/:taskId/images/:imageId` — Remove uma imagem específica do banco e do disco

## Parte C — Integração com o frontend

- Serviço `TaskImages` estendendo `HttpClientBase` (`views/assets/_common/classes/TaskImages.js`).
- Classe de entidade `TaskImage` (`views/assets/_common/models/TaskImage.js`).
- Tela de Perfil em `app/index.html` com prévia de foto, validação e upload.
- Modal de Galeria de Imagens 1:N em `app/index.html` integrado a cada tarefa.
