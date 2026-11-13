window.I18N = {};
const languages = ["es", "en", "pt", "zh", "ja", "ru"];
const words = `
workspace|ESPACIO DE TRABAJO|WORKSPACE|ESPAÇO DE TRABALHO|工作区|ワークスペース|РАБОЧАЯ ОБЛАСТЬ
overview|Vista general|Overview|Visão geral|概览|概要|Обзор
servers|Mis servidores|My servers|Meus servidores|我的服务器|サーバー|Мои серверы
dashboard|Panel del servidor|Server overview|Painel do servidor|服务器概览|サーバー概要|Панель сервера
config|Configuración|Configuration|Configuração|配置|設定|Настройки
console|Consola|Console|Console|控制台|コンソール|Консоль
players|Jugadores|Players|Jogadores|玩家|プレイヤー|Игроки
chat|Chat|Chat|Chat|聊天|チャット|Чат
mods|Mods|Mods|Mods|模组|MOD|Моды
backups|Copias de seguridad|Backups|Cópias de segurança|备份|バックアップ|Резервные копии
automation|Automatización|Automation|Automação|自动化|自動化|Автоматизация
events|Eventos|Events|Eventos|事件|イベント|События
schedules|Tareas programadas|Schedules|Tarefas agendadas|计划任务|スケジュール|Расписание
community|Comunidad|Community|Comunidade|社区|コミュニティ|Сообщество
groups|Grupos y permisos|Groups & permissions|Grupos e permissões|群组和权限|グループと権限|Группы и права
rewards|Recompensas|Rewards|Recompensas|奖励|報酬|Награды
economy|Economía|Economy|Economia|经济|エコノミー|Экономика
teleports|Teletransportes|Teleports|Teleportes|传送|テレポート|Телепорты
voting|Votaciones|Voting|Votação|投票|投票|Голосование
map|Mapa web|Web map|Mapa web|网页地图|Webマップ|Веб-карта
inventory|Inventarios|Inventories|Inventários|物品栏|インベントリ|Инвентарь
integrations|Integraciones|Integrations|Integrações|集成|連携|Интеграции
preferences|Preferencias|Preferences|Preferências|偏好设置|環境設定|Параметры
dark|Modo oscuro|Dark mode|Modo escuro|深色模式|ダークモード|Тёмная тема
light|Modo claro|Light mode|Modo claro|浅色模式|ライトモード|Светлая тема
newServer|Nuevo servidor|New server|Novo servidor|新建服务器|サーバーを作成|Новый сервер
welcome|Tu próximo mundo empieza aquí.|Your next world starts here.|Seu próximo mundo começa aqui.|你的下一个世界从这里开始。|次の世界は、ここから。|Твой новый мир начинается здесь.
welcomeSub|Todos tus mundos. Un solo centro de mando.|All your worlds. One command center.|Todos os seus mundos. Um centro de comando.|所有世界，一个控制中心。|すべての世界を、ひとつの場所で。|Все миры в одном центре управления.
yourServers|Tus servidores|Your servers|Seus servidores|你的服务器|あなたのサーバー|Твои серверы
emptyTitle|Prepara tu primer refugio|Prepare your first shelter|Prepare seu primeiro abrigo|准备你的第一个避难所|最初の拠点を作ろう|Создай своё первое убежище
emptyText|Crea un servidor local o conecta uno remoto. Cada mundo tiene sus propios ajustes y mods.|Create a local server or connect a remote one. Every world has its own settings and mods.|Crie um servidor local ou conecte um remoto. Cada mundo tem suas configurações e mods.|创建本地服务器或连接远程服务器。每个世界都有独立配置和模组。|ローカルサーバーを作成するか、リモートに接続。世界ごとに設定とMODを管理できます。|Создай локальный сервер или подключи удалённый. У каждого мира свои настройки и моды.
total|Servidores|Servers|Servidores|服务器|サーバー数|Серверы
online|En marcha|Running|Em execução|运行中|稼働中|Работают
connected|Conectado|Connected|Conectado|已连接|接続済み|Подключено
disconnected|Desconectado|Disconnected|Desconectado|已断开|未接続|Отключено
stopped|Detenido|Stopped|Parado|已停止|停止中|Остановлен
starting|Arrancando|Starting|Iniciando|启动中|起動中|Запускается
running|En marcha|Running|Em execução|运行中|稼働中|Работает
stopping|Deteniendo|Stopping|Parando|停止中|終了中|Останавливается
local|Local|Local|Local|本地|ローカル|Локальный
remote|Remoto|Remote|Remoto|远程|リモート|Удалённый
start|Iniciar|Start|Iniciar|启动|起動|Запустить
stop|Detener|Stop|Parar|停止|停止|Остановить
restart|Reiniciar|Restart|Reiniciar|重启|再起動|Перезапустить
connect|Conectar|Connect|Conectar|连接|接続|Подключить
disconnect|Desconectar|Disconnect|Desconectar|断开|切断|Отключить
install|Instalar / actualizar|Install / update|Instalar / atualizar|安装 / 更新|インストール / 更新|Установить / обновить
save|Guardar cambios|Save changes|Salvar alterações|保存更改|変更を保存|Сохранить
cancel|Cancelar|Cancel|Cancelar|取消|キャンセル|Отмена
close|Cerrar|Close|Fechar|关闭|閉じる|Закрыть
add|Añadir|Add|Adicionar|添加|追加|Добавить
edit|Editar|Edit|Editar|编辑|編集|Изменить
remove|Quitar|Remove|Remover|移除|削除|Убрать
name|Nombre|Name|Nome|名称|名前|Название
type|Tipo|Type|Tipo|类型|種類|Тип
directory|Carpeta del servidor|Server folder|Pasta do servidor|服务器文件夹|サーバーフォルダー|Папка сервера
browse|Examinar|Browse|Procurar|浏览|参照|Обзор
host|Dirección del servidor|Server address|Endereço do servidor|服务器地址|サーバーアドレス|Адрес сервера
version|Versión / rama de Steam|Version / Steam branch|Versão / ramo Steam|版本 / Steam 分支|バージョン / Steamブランチ|Версия / ветка Steam
refreshVersions|Actualizar versiones|Refresh versions|Atualizar versões|刷新版本|バージョンを更新|Обновить версии
versionHelp|Se muestran las ramas que Steam distribuye actualmente. La misma versión debe estar instalada en los clientes. Puedes escribir una rama exacta para versiones futuras.|Only branches currently distributed by Steam are listed. Clients must use the same version. Enter an exact branch for future versions.|São listados os ramos distribuídos pelo Steam. Os clientes devem usar a mesma versão. Digite um ramo exato para versões futuras.|仅列出 Steam 当前提供的分支。客户端必须使用相同版本，也可输入未来版本的准确分支名。|Steamで提供中のブランチを表示。クライアントも同じバージョンが必要です。今後のブランチ名も入力できます。|Показаны доступные ветки Steam. Клиентам нужна та же версия. Можно ввести точное имя будущей ветки.
gamePort|Puerto del juego|Game port|Porta do jogo|游戏端口|ゲームポート|Порт игры
telnetPort|Puerto Telnet|Telnet port|Porta Telnet|Telnet 端口|Telnetポート|Порт Telnet
webPort|Puerto del panel web|Web dashboard port|Porta do painel web|网页面板端口|Webダッシュボードのポート|Порт веб-панели
password|Contraseña|Password|Senha|密码|パスワード|Пароль
telnetPassword|Contraseña de Telnet|Telnet password|Senha do Telnet|Telnet 密码|Telnetパスワード|Пароль Telnet
maxPlayers|Plazas|Player slots|Vagas|玩家上限|最大人数|Слоты
world|Mundo|World|Mundo|世界|ワールド|Мир
worldName|Nombre de la partida|Save name|Nome da partida|存档名称|セーブ名|Название сохранения
seed|Semilla del mundo|World seed|Semente do mundo|世界种子|シード|Сид мира
worldSize|Tamaño del mundo|World size|Tamanho do mundo|世界大小|ワールドサイズ|Размер мира
autoConnect|Reconectar automáticamente|Auto reconnect|Reconectar automaticamente|自动重连|自動再接続|Переподключаться
autoRestart|Reiniciar tras un fallo (máx. 3 / 10 min)|Restart after crash (max 3 / 10 min)|Reiniciar após falha (máx. 3 / 10 min)|崩溃后重启（10分钟内最多3次）|クラッシュ時に再起動（10分で最大3回）|Перезапуск при сбое (до 3 за 10 мин)
connectCommands|Comandos al conectar (uno por línea)|Commands on connect (one per line)|Comandos ao conectar (um por linha)|连接时执行的命令（每行一个）|接続時のコマンド（1行1件）|Команды при подключении (по одной в строке)
basics|Lo esencial|Essentials|Essencial|基本设置|基本設定|Основное
advanced|Opciones del juego|Game options|Opções do jogo|游戏选项|ゲーム設定|Параметры игры
search|Buscar…|Search…|Pesquisar…|搜索…|検索…|Поиск…
sourceOptions|Las opciones se leen del serverconfig.xml de tu versión. Los nombres originales permiten consultar la documentación del juego.|Options come from your version's serverconfig.xml. Original names let you consult the game documentation.|As opções vêm do serverconfig.xml da sua versão. Os nomes originais ajudam a consultar a documentação.|选项来自当前版本的 serverconfig.xml。原始名称便于查阅游戏文档。|使用バージョンのserverconfig.xmlから設定を読み込みます。元の名称でゲーム資料を参照できます。|Параметры читаются из serverconfig.xml вашей версии. Оригинальные имена помогают найти документацию.
sandboxHelp|Esta versión usa SandboxCode. Copia el código desde las opciones de una nueva partida del juego y pégalo aquí.|This version uses SandboxCode. Copy the code from the game's new-game sandbox options and paste it here.|Esta versão usa SandboxCode. Copie o código das opções de uma nova partida e cole aqui.|此版本使用 SandboxCode。请从游戏新建世界的沙盒选项中复制代码并粘贴。|このバージョンはSandboxCodeを使用。ゲームの新規ワールドのサンドボックス設定からコードをコピーしてください。|Эта версия использует SandboxCode. Скопируй код из настроек новой игры и вставь сюда.
import|Importar|Import|Importar|导入|インポート|Импорт
export|Exportar|Export|Exportar|导出|エクスポート|Экспорт
openFolder|Abrir carpeta|Open folder|Abrir pasta|打开文件夹|フォルダーを開く|Открыть папку
saved|Cambios guardados|Changes saved|Alterações salvas|更改已保存|保存しました|Изменения сохранены
success|Operación completada|Operation completed|Operação concluída|操作完成|操作が完了しました|Операция завершена
error|No se pudo completar la operación|The operation could not be completed|Não foi possível concluir a operação|操作无法完成|操作を完了できませんでした|Не удалось завершить операцию
busy|Hay una tarea en curso. Espera a que termine.|A task is in progress. Wait for it to finish.|Há uma tarefa em execução. Aguarde a conclusão.|任务正在进行，请等待完成。|処理が実行中です。完了までお待ちください。|Выполняется задача. Дождись завершения.
stopFirst|Detén el servidor antes de hacer este cambio.|Stop the server before making this change.|Pare o servidor antes desta alteração.|请先停止服务器再进行更改。|変更する前にサーバーを停止してください。|Перед изменением останови сервер.
notConnected|Conecta la consola Telnet del servidor para usar esta función.|Connect the server's Telnet console to use this feature.|Conecte o console Telnet para usar esta função.|使用此功能前请连接服务器的 Telnet 控制台。|この機能にはTelnet接続が必要です。|Для этой функции подключи Telnet-консоль.
notInstalled|Instala primero el servidor dedicado.|Install the dedicated server first.|Instale primeiro o servidor dedicado.|请先安装专用服务器。|先に専用サーバーをインストールしてください。|Сначала установи выделенный сервер.
portConflict|Los puertos se solapan con otro servicio o servidor del manager.|Ports overlap another service or managed server.|As portas se sobrepõem a outro serviço ou servidor.|端口与其他服务或服务器重叠。|ポートが他のサービスやサーバーと重複しています。|Порты пересекаются с другим сервисом или сервером.
invalidName|Escribe un nombre válido.|Enter a valid name.|Digite um nome válido.|请输入有效名称。|有効な名前を入力してください。|Введи допустимое имя.
localOnly|Esta función requiere un servidor local. Los servidores remotos se administran mediante Telnet y la API.|This feature requires a local server. Remote servers are managed through Telnet and the API.|Esta função requer um servidor local. Servidores remotos são gerenciados por Telnet e API.|此功能需要本地服务器。远程服务器通过 Telnet 和 API 管理。|この機能はローカル専用です。リモートはTelnetとAPIで管理します。|Эта функция требует локального сервера. Удалённые управляются через Telnet и API.
confirm|Confirmar|Confirm|Confirmar|确认|確認|Подтвердить
removeHelp|Se quitará el perfil del manager. Las carpetas y los mundos se conservarán.|This removes the manager profile. Folders and worlds are kept.|O perfil será removido do manager. Pastas e mundos serão mantidos.|将移除管理器中的配置，文件夹和世界会保留。|管理プロフィールを削除します。フォルダーとワールドは保持されます。|Будет удалён профиль менеджера. Папки и миры сохранятся.
installHelp|Se descargará y validará la rama elegida. Se guardará una copia previa si ya existe configuración. Cambiar de versión puede requerir un mundo nuevo.|The selected branch will be downloaded and validated. Existing configuration is backed up first. Changing versions may require a new world.|O ramo selecionado será baixado e validado. A configuração existente terá cópia prévia. Mudar a versão pode exigir um novo mundo.|将下载并验证所选分支，已有配置会先备份。切换版本可能需要新建世界。|選択したブランチをダウンロードして検証します。既存設定は先にバックアップ。バージョン変更で新ワールドが必要になる場合があります。|Выбранная ветка будет загружена и проверена. Существующие настройки сначала сохранятся. Смена версии может требовать новый мир.
send|Enviar|Send|Enviar|发送|送信|Отправить
command|Comando|Command|Comando|命令|コマンド|Команда
clear|Limpiar vista|Clear view|Limpar visualização|清空视图|表示を消去|Очистить экран
pause|Pausar desplazamiento|Pause scrolling|Pausar rolagem|暂停滚动|スクロールを停止|Остановить прокрутку
resume|Seguir salida|Follow output|Seguir saída|跟随输出|出力を追従|Следить за выводом
all|Todo|All|Tudo|全部|すべて|Все
noLogs|La salida del servidor aparecerá aquí.|Server output will appear here.|A saída do servidor aparecerá aqui.|服务器输出将显示在这里。|サーバー出力がここに表示されます。|Здесь появится вывод сервера.
consoleHelp|Comandos reales del servidor, sin ejecutar instrucciones de Windows. Usa help para consultar los disponibles en tu versión.|Real server commands. No Windows commands are executed. Use help to list commands for your version.|Comandos reais do servidor. Nenhum comando do Windows é executado. Use help para listar os disponíveis.|执行真实服务器命令，不执行 Windows 指令。使用 help 查看当前版本可用命令。|実際のサーバーコマンドです。helpで使用バージョンのコマンドを確認できます。|Реальные команды сервера. Команды Windows не выполняются. Введи help для списка.
noPlayers|No hay jugadores conectados.|No players connected.|Nenhum jogador conectado.|没有在线玩家。|接続中のプレイヤーはいません。|Нет подключённых игроков.
player|Jugador / ID|Player / ID|Jogador / ID|玩家 / ID|プレイヤー / ID|Игрок / ID
level|Nivel de permiso|Permission level|Nível de permissão|权限等级|権限レベル|Уровень прав
position|Posición (x, y, z)|Position (x, y, z)|Posição (x, y, z)|坐标（x, y, z）|位置 (x, y, z)|Позиция (x, y, z)
reason|Motivo|Reason|Motivo|原因|理由|Причина
kick|Expulsar|Kick|Expulsar|踢出|キック|Выгнать
ban|Bloquear|Ban|Banir|封禁|BAN|Заблокировать
unban|Quitar bloqueo|Unban|Desbanir|解封|BAN解除|Разблокировать
admin|Dar permisos|Grant permissions|Conceder permissões|授予权限|権限を付与|Выдать права
removeAdmin|Quitar permisos|Remove permissions|Remover permissões|移除权限|権限を削除|Убрать права
whitelist|Añadir a lista blanca|Whitelist|Adicionar à lista branca|加入白名单|許可リストに追加|В белый список
removeWhitelist|Quitar de lista blanca|Remove from whitelist|Remover da lista branca|移出白名单|許可リストから削除|Из белого списка
teleport|Teletransportar|Teleport|Teleportar|传送|テレポート|Телепортировать
give|Dar objeto|Give item|Dar item|给予物品|アイテムを付与|Выдать предмет
buff|Aplicar efecto|Apply buff|Aplicar efeito|应用效果|バフを付与|Применить эффект
duration|Duración (días)|Duration (days)|Duração (dias)|持续时间（天）|期間（日）|Срок (дни)
item|Identificador del objeto|Item identifier|Identificador do item|物品标识符|アイテムID|Идентификатор предмета
count|Cantidad|Quantity|Quantidade|数量|数量|Количество
quality|Calidad (1–6)|Quality (1–6)|Qualidade (1–6)|品质（1–6）|品質 (1–6)|Качество (1–6)
actions|Acciones|Actions|Ações|操作|操作|Действия
refresh|Actualizar|Refresh|Atualizar|刷新|更新|Обновить
importZip|Importar ZIP|Import ZIP|Importar ZIP|导入 ZIP|ZIPを取り込む|Импорт ZIP
importFolder|Importar carpeta|Import folder|Importar pasta|导入文件夹|フォルダーを取り込む|Импорт папки
modsHelp|Importa carpetas o ZIP con ModInfo.xml. Los archivos se comprueban antes de copiarlos a Mods. Detén el servidor para cambiar los mods.|Import folders or ZIP files containing ModInfo.xml. Files are validated before copying into Mods. Stop the server to change mods.|Importe pastas ou ZIP com ModInfo.xml. Os arquivos são verificados antes da cópia para Mods. Pare o servidor para alterar mods.|导入含 ModInfo.xml 的文件夹或 ZIP。文件验证后复制到 Mods。更改模组前请停止服务器。|ModInfo.xmlを含むフォルダーかZIPを取り込みます。検証後にModsへコピー。変更時はサーバーを停止してください。|Импортируй папки или ZIP с ModInfo.xml. Файлы проверяются перед копированием в Mods. Для изменений останови сервер.
noMods|Todavía no hay mods instalados.|No mods installed yet.|Ainda não há mods instalados.|尚未安装模组。|MODはまだありません。|Моды пока не установлены.
enabled|Activado|Enabled|Ativado|启用|有効|Включено
disabled|Desactivado|Disabled|Desativado|禁用|無効|Выключено
enable|Activar|Enable|Ativar|启用|有効にする|Включить
disable|Desactivar|Disable|Desativar|禁用|無効にする|Выключить
backupNow|Crear copia|Create backup|Criar cópia|创建备份|バックアップを作成|Создать копию
restore|Restaurar|Restore|Restaurar|恢复|復元|Восстановить
backupHelp|Las copias incluyen mundos, configuración y mods. Las copias manuales requieren el servidor detenido; las programadas lo detienen y lo vuelven a iniciar para conservar un estado coherente.|Backups include worlds, settings and mods. Manual backups require a stopped server; scheduled backups stop and restart it for a consistent snapshot.|As cópias incluem mundos, configuração e mods. Cópias manuais exigem o servidor parado; as agendadas param e reiniciam o servidor para manter a consistência.|备份包含世界、配置和模组。手动备份需要停止服务器；计划备份会停止并重启服务器以确保一致性。|ワールド・設定・MODを保存。手動は停止中に作成。定期バックアップは整合性を保つため停止後に保存し再起動します。|Копии включают миры, настройки и моды. Для ручной копии сервер должен быть остановлен; плановая остановит и запустит его.
restoreHelp|Se restaurarán los datos de esta copia. Los datos anteriores quedarán en una carpeta before-restore para poder recuperarlos.|Data from this backup will be restored. Previous data is retained in a before-restore folder for recovery.|Os dados desta cópia serão restaurados. Os anteriores serão mantidos numa pasta before-restore.|将恢复此备份的数据。原数据保留在 before-restore 文件夹，便于恢复。|このバックアップを復元します。現在のデータはbefore-restoreフォルダーに保持します。|Данные будут восстановлены из копии. Текущие данные останутся в папке before-restore.
noBackups|Aún no hay copias de seguridad.|No backups yet.|Ainda não há cópias de segurança.|暂无备份。|バックアップはまだありません。|Резервных копий пока нет.
automaticBackup|Copias automáticas|Automatic backups|Cópias automáticas|自动备份|自動バックアップ|Автоматические копии
interval|Intervalo (minutos)|Interval (minutes)|Intervalo (minutos)|间隔（分钟）|間隔（分）|Интервал (минуты)
keep|Copias que conservar|Backups to keep|Cópias a manter|保留的备份数|保持する数|Хранить копий
date|Fecha|Date|Data|日期|日付|Дата
size|Tamaño|Size|Tamanho|大小|サイズ|Размер
trigger|Cuándo ocurre|Trigger|Quando ocorre|触发条件|トリガー|Когда срабатывает
match|Texto que debe coincidir|Text to match|Texto a corresponder|匹配文本|一致するテキスト|Текст для совпадения
condition|Comparación|Comparison|Comparação|比较|比較|Сравнение
contains|Contiene|Contains|Contém|包含|含む|Содержит
starts|Empieza por|Starts with|Começa com|开头为|で始まる|Начинается с
equals|Es igual a|Equals|É igual a|等于|と等しい|Равно
any|Cualquiera|Any|Qualquer|任意|すべて|Любое
cooldownSeconds|Espera entre usos (segundos)|Cooldown (seconds)|Espera entre usos (segundos)|冷却时间（秒）|クールダウン（秒）|Перерыв (секунды)
script|Acciones (una por línea)|Actions (one per line)|Ações (uma por linha)|操作（每行一个）|操作（1行1件）|Действия (по одному в строке)
eventHelp|Crea reglas sin ejecutar código del sistema. Acciones: console, say, discord, currency, reward, teleport, set y wait. Variables: {player}, {name}, {text}, {entity}, {level} y tus variables globales.|Create rules without running system code. Actions: console, say, discord, currency, reward, teleport, set, wait. Variables: {player}, {name}, {text}, {entity}, {level} and global variables.|Crie regras sem executar código do sistema. Ações: console, say, discord, currency, reward, teleport, set e wait. Variáveis: {player}, {name}, {text}, {entity}, {level} e variáveis globais.|创建规则，不执行系统代码。操作：console、say、discord、currency、reward、teleport、set、wait。变量：{player}、{name}、{text}、{entity}、{level} 及全局变量。|システムコードを実行せずルールを作成。操作: console, say, discord, currency, reward, teleport, set, wait。変数: {player}, {name}, {text}, {entity}, {level} とグローバル変数。|Правила без выполнения системного кода. Действия: console, say, discord, currency, reward, teleport, set, wait. Переменные: {player}, {name}, {text}, {entity}, {level} и глобальные.
emptyList|No hay elementos todavía.|No entries yet.|Ainda não há itens.|暂无条目。|項目はまだありません。|Записей пока нет.
repeat|Repetición|Repeat|Repetição|重复|繰り返し|Повтор
intervalMode|Cada intervalo|Every interval|A cada intervalo|按间隔|一定間隔|Через интервал
daily|Todos los días|Every day|Todos os dias|每天|毎日|Ежедневно
once|Una vez|Once|Uma vez|一次|1回|Один раз
time|Hora local|Local time|Hora local|本地时间|現地時間|Местное время
action|Acción|Action|Ação|操作|操作|Действие
nextRun|Próxima ejecución|Next run|Próxima execução|下次执行|次回実行|Следующий запуск
scheduleHelp|Las tareas se ejecutan mientras el manager está abierto, también en la bandeja. Las tareas vencidas se ejecutan una sola vez al volver a abrirlo.|Tasks run while the manager is open, including in the tray. Overdue tasks run once when reopened.|As tarefas funcionam enquanto o manager está aberto, inclusive na bandeja. Tarefas atrasadas executam uma vez ao reabrir.|管理器运行时（含托盘）执行任务。重新打开后，逾期任务仅执行一次。|トレイを含め、アプリ稼働中に実行。再起動時に期限切れのタスクを1回実行します。|Задачи работают, пока менеджер открыт, в том числе в трее. Просроченные выполнятся один раз при запуске.
members|IDs de miembros (uno por línea)|Member IDs (one per line)|IDs dos membros (um por linha)|成员 ID（每行一个）|メンバーID（1行1件）|ID участников (по одному в строке)
groupHelp|Los grupos limitan los eventos a sus miembros. Los permisos del juego se asignan desde Jugadores; 0 es el nivel de máxima autoridad.|Groups restrict events to their members. Game permissions are granted in Players; 0 is the highest authority.|Grupos limitam eventos aos membros. Permissões do jogo são atribuídas em Jogadores; 0 é o nível máximo.|群组将事件限制为成员触发。游戏权限在玩家页面授予，0 为最高权限。|グループでイベント対象を制限。ゲーム権限はプレイヤー画面で付与。0が最高権限です。|Группы ограничивают события участниками. Игровые права выдаются в разделе игроков; 0 — высший уровень.
group|Grupo (opcional)|Group (optional)|Grupo (opcional)|群组（可选）|グループ（任意）|Группа (необязательно)
cost|Coste|Cost|Custo|费用|コスト|Стоимость
random|Entregar un objeto al azar|Deliver one random item|Entregar um item aleatório|随机给予一件物品|ランダムに1個付与|Выдать один случайный предмет
items|Objetos (ID, cantidad, calidad; uno por línea)|Items (ID, quantity, quality; one per line)|Itens (ID, quantidade, qualidade; um por linha)|物品（ID,数量,品质；每行一个）|アイテム（ID,数量,品質；1行1件）|Предметы (ID,количество,качество; по одному в строке)
rewardHelp|Crea bolsas de objetos y asígnales un coste. Los jugadores pueden usar !bag nombre y !balance. Las entregas dudosas quedan marcadas para revisión y no se repiten automáticamente.|Create item bags and set their cost. Players can use !bag name and !balance. Uncertain deliveries are flagged for review and never retried automatically.|Crie bolsas de itens e defina o custo. Jogadores podem usar !bag nome e !balance. Entregas incertas ficam para revisão e não são repetidas.|创建物品奖励包并设置费用。玩家可使用 !bag 名称 和 !balance。不确定的交付会标记待审核，不会自动重试。|報酬袋と価格を設定。!bag 名前 と !balance を使用できます。結果が不明な配布は要確認となり、自動再送しません。|Создавай наборы предметов и их стоимость. Игроки используют !bag имя и !balance. Неопределённые выдачи требуют проверки и не повторяются автоматически.
wallet|Saldo|Balance|Saldo|余额|残高|Баланс
amount|Cantidad que sumar o restar|Amount to add or subtract|Quantidade a somar ou subtrair|增加或减少的数额|加算・減算する量|Сколько добавить или снять
joinReward|Monedas al conectarse|Coins on join|Moedas ao entrar|加入奖励金币|接続時のコイン|Монеты при входе
minuteReward|Monedas por minuto conectado|Coins per online minute|Moedas por minuto conectado|每分钟在线金币|オンライン1分あたりのコイン|Монеты за минуту онлайн
teleportCost|Coste de teletransporte|Teleport cost|Custo do teleporte|传送费用|テレポートのコスト|Стоимость телепорта
pendingDeliveries|Historial de entregas|Delivery history|Histórico de entregas|交付记录|配布履歴|История выдач
teleportHelp|Guarda destinos con coordenadas x, y, z. Los jugadores pueden usar !tele nombre. Se aplican el coste y la espera configurados.|Save destinations with x, y, z coordinates. Players can use !tele name. Configured cost and cooldown apply.|Salve destinos com coordenadas x, y, z. Jogadores podem usar !tele nome. O custo e a espera configurados são aplicados.|使用 x,y,z 坐标保存目的地。玩家可使用 !tele 名称，按设置收取费用并应用冷却。|x,y,z座標で目的地を保存。!tele 名前 で移動。設定したコストとクールダウンを適用します。|Сохраняй точки с координатами x,y,z. Игроки используют !tele имя. Применяются стоимость и перерыв.
security|Moderación y protección|Moderation & protection|Moderação e proteção|管理与保护|モデレーションと保護|Модерация и защита
pingCheck|Expulsar por ping alto|Kick for high ping|Expulsar por ping alto|高延迟踢出|高Pingでキック|Выгонять за высокий пинг
maxPing|Ping máximo (ms)|Maximum ping (ms)|Ping máximo (ms)|最大延迟（毫秒）|最大Ping（ms）|Максимальный пинг (мс)
failures|Comprobaciones consecutivas fallidas|Consecutive failed checks|Falhas consecutivas|连续失败次数|連続失敗回数|Ошибок подряд
vacCheck|Comprobar sanciones VAC al entrar|Check VAC bans on join|Verificar banimentos VAC ao entrar|加入时检查 VAC 封禁|接続時にVACを確認|Проверять VAC при входе
apiKey|Clave API|API key|Chave API|API 密钥|APIキー|Ключ API
steamApiKey|Clave de Steam Web API|Steam Web API key|Chave Steam Web API|Steam Web API 密钥|Steam Web APIキー|Ключ Steam Web API
maxVacBans|Máximo de sanciones VAC permitidas|Maximum allowed VAC bans|Máximo de banimentos VAC permitidos|允许的最大 VAC 封禁次数|許可するVAC件数|Допустимо блокировок VAC
apiBase|URL base de la API / mapa|API / map base URL|URL base da API / mapa|API / 地图基础 URL|API / マップのベースURL|Базовый URL API / карты
tokenName|Nombre del token API|API token name|Nome do token API|API 令牌名称|APIトークン名|Имя токена API
token|Token / secreto|Token / secret|Token / segredo|令牌 / 密钥|トークン / シークレット|Токен / секрет
apiHelp|Los inventarios necesitan una API compatible con Alloc (getplayerinventory). El mapa se abre en el panel web configurado. Instala los mods compatibles con tu versión; el manager no incluye mods de terceros.|Inventories require an Alloc-compatible API (getplayerinventory). The map opens in the configured web dashboard. Install mods compatible with your version; third-party mods are not bundled.|Inventários exigem API compatível com Alloc (getplayerinventory). O mapa abre no painel web configurado. Instale mods compatíveis com sua versão; mods de terceiros não estão incluídos.|物品栏需要兼容 Alloc 的 API（getplayerinventory）。地图在配置的网页面板打开。请安装兼容当前版本的模组，程序不附带第三方模组。|インベントリはAlloc互換APIが必要です。マップは設定したWebパネルで開きます。対応MODは別途導入してください。|Инвентарь требует API, совместимый с Alloc (getplayerinventory). Карта открывается в веб-панели. Совместимые моды устанавливаются отдельно.
discordToken|Token del bot de Discord|Discord bot token|Token do bot Discord|Discord 机器人令牌|Discordボットトークン|Токен бота Discord
channelId|ID del canal de Discord|Discord channel ID|ID do canal Discord|Discord 频道 ID|DiscordチャンネルID|ID канала Discord
roleId|ID del rol que puede usar !server|Role ID allowed to use !server|ID do cargo autorizado a usar !server|可使用 !server 的角色 ID|!serverを許可するロールID|ID роли для команды !server
relay|Enlazar chat del juego y Discord|Relay game and Discord chat|Vincular chat do jogo e Discord|转发游戏和 Discord 聊天|ゲームとDiscordのチャットを中継|Связать чат игры и Discord
discordHelp|Activa Message Content Intent en tu bot. Al conectar se usa el canal indicado. Solo el rol configurado puede enviar !server comando; el resto del chat se enlaza si lo activas.|Enable Message Content Intent for your bot. It uses the selected channel. Only the configured role can send !server command; other chat is relayed if enabled.|Ative Message Content Intent no bot. O canal indicado será usado. Só o cargo configurado pode enviar !server comando; outros chats são vinculados se ativado.|请为机器人启用 Message Content Intent。使用指定频道，仅配置角色可执行 !server 命令。启用转发后同步其余聊天。|ボットのMessage Content Intentを有効にしてください。指定ロールのみ!server コマンドを使用できます。|Включи Message Content Intent у бота. Только указанная роль может отправлять !server команда. Остальной чат передаётся при включении.
voteUrl|Enlace de votación|Voting link|Link de votação|投票链接|投票リンク|Ссылка голосования
voteBag|Bolsa de recompensa|Reward bag|Bolsa de recompensa|奖励包|報酬袋|Набор награды
voteHelp|Compatible con la API de 7daystodie-servers.com. Los jugadores usan !vote con su Steam ID. La clave y el registro de votos se guardan por servidor.|Compatible with the 7daystodie-servers.com API. Players use !vote with their Steam ID. Keys and vote records are kept per server.|Compatível com a API de 7daystodie-servers.com. Jogadores usam !vote com Steam ID. Chaves e votos são salvos por servidor.|兼容 7daystodie-servers.com API。玩家通过 Steam ID 使用 !vote。每个服务器独立保存密钥和投票记录。|7daystodie-servers.com APIに対応。Steam IDで!voteを使用。キーと投票履歴はサーバーごとに保存。|Совместимо с API 7daystodie-servers.com. Игроки используют !vote со Steam ID. Ключи и голоса хранятся по серверам.
claim|Reclamar voto|Claim vote|Resgatar voto|领取投票|投票を受け取る|Получить голос
voters|Consultar votantes|View voters|Consultar votantes|查看投票者|投票者を確認|Посмотреть голосовавших
loading|Preparando tu próximo mundo…|Preparing your next world…|Preparando seu próximo mundo…|正在准备你的下一个世界…|次の世界を準備しています…|Готовим твой новый мир…
tray|Mantener en la bandeja al cerrar|Keep in tray on close|Manter na bandeja ao fechar|关闭后保留在托盘|閉じたらトレイに格納|Сворачивать в трей при закрытии
trayHelp|Si hay servidores o tareas activos, el manager permanece en la bandeja para seguir administrándolos. Para salir, usa el menú del icono de la bandeja.|While servers or tasks are active, the manager stays in the tray. Use the tray icon menu to exit.|Com servidores ou tarefas ativos, o manager permanece na bandeja. Use o menu do ícone para sair.|服务器或任务运行时，管理器保留在托盘。请使用托盘图标菜单退出。|サーバーや処理の実行中はトレイに常駐します。終了にはトレイメニューを使用してください。|При работающих серверах или задачах менеджер остаётся в трее. Для выхода используй меню значка.
steamcmd|Ruta de SteamCMD (opcional)|SteamCMD path (optional)|Caminho do SteamCMD (opcional)|SteamCMD 路径（可选）|SteamCMDパス（任意）|Путь SteamCMD (необязательно)
steamcmdHelp|Si no eliges uno, se descarga automáticamente de Valve al instalar un servidor o consultar versiones.|If none is selected, it is downloaded from Valve when installing a server or refreshing versions.|Se não escolher um, será baixado da Valve ao instalar um servidor ou consultar versões.|未选择时，将在安装服务器或刷新版本时从 Valve 自动下载。|未指定の場合、インストールやバージョン更新時にValveから自動取得します。|Если не выбран, загрузится с Valve при установке сервера или обновлении версий.
minutes|Minutos|Minutes|Minutos|分钟|分|Минуты
seconds|Segundos de aviso|Countdown seconds|Segundos de aviso|倒计时秒数|予告の秒数|Секунды предупреждения
message|Mensaje a los jugadores|Message to players|Mensagem aos jogadores|发送给玩家的消息|プレイヤーへのメッセージ|Сообщение игрокам
countdown|Apagado programado|Shutdown countdown|Desligamento agendado|关闭倒计时|停止カウントダウン|Отсчёт остановки
cancelCountdown|Cancelar apagado|Cancel shutdown|Cancelar desligamento|取消关闭|停止を取り消す|Отменить остановку
forceStop|Forzar cierre|Force stop|Forçar encerramento|强制停止|強制終了|Завершить принудительно
forceHelp|El cierre forzado puede perder el progreso que no se haya guardado. Úsalo solo si el apagado normal no responde.|Force stopping may lose unsaved progress. Use only when normal shutdown is unresponsive.|Forçar o encerramento pode perder progresso não salvo. Use apenas se o desligamento normal não responder.|强制停止可能丢失未保存的进度，仅在正常关闭无响应时使用。|未保存データを失う可能性があります。通常停止が応答しない場合のみ使用してください。|Принудительное завершение может потерять несохранённый прогресс. Используй лишь при зависании.
uptime|Tiempo en marcha|Uptime|Tempo de atividade|运行时间|稼働時間|Время работы
gameTime|Hora del mundo|World time|Hora do mundo|世界时间|ゲーム時刻|Время мира
activity|Actividad reciente|Recent activity|Atividade recente|最近活动|最近のアクティビティ|Последние действия
quickActions|A un clic|Quick actions|Ações rápidas|快捷操作|クイック操作|Быстрые действия
manage|Administrar|Manage|Gerenciar|管理|管理|Управлять
noData|Sin datos todavía|No data yet|Sem dados ainda|暂无数据|データはまだありません|Данных пока нет
language|Idioma|Language|Idioma|语言|言語|Язык
appearance|Apariencia|Appearance|Aparência|外观|外観|Внешний вид
readInventory|Consultar inventario|Read inventory|Consultar inventário|查看物品栏|インベントリを取得|Прочитать инвентарь
catalog|Leer objetos de esta versión|Read this version's items|Ler itens desta versão|读取此版本物品|このバージョンのアイテムを読む|Прочитать предметы этой версии
noFakeData|Las estadísticas aparecerán al conectar el servidor.|Statistics appear when the server connects.|As estatísticas aparecem ao conectar o servidor.|连接服务器后显示统计信息。|サーバー接続後に統計が表示されます。|Статистика появится после подключения сервера.
result|Resultado|Result|Resultado|结果|結果|Результат
variables|Variables globales (JSON)|Global variables (JSON)|Variáveis globais (JSON)|全局变量（JSON）|グローバル変数（JSON）|Глобальные переменные (JSON)
securityHelp|El ping se comprueba cada 15 segundos. VAC consulta Steam al detectar una conexión. Estas reglas solo actúan mientras el manager está conectado.|Ping is checked every 15 seconds. VAC queries Steam when a player joins. Rules only run while the manager is connected.|O ping é verificado a cada 15 segundos. VAC consulta Steam na entrada. As regras funcionam enquanto o manager está conectado.|每15秒检查延迟，玩家加入时查询 Steam VAC。规则仅在管理器连接时生效。|Pingは15秒ごと、VACは接続時にSteamへ照会。管理アプリ接続中のみ動作します。|Пинг проверяется каждые 15 секунд. VAC проверяется в Steam при входе. Правила работают при подключённом менеджере.
unsaved|Hay cambios sin guardar. ¿Quieres descartarlos?|There are unsaved changes. Discard them?|Há alterações não salvas. Deseja descartá-las?|存在未保存的更改，是否放弃？|未保存の変更があります。破棄しますか？|Есть несохранённые изменения. Отменить их?
backupStopFirst|Para una copia manual coherente, detén primero el servidor.|Stop the server before creating a consistent manual backup.|Pare o servidor antes de uma cópia manual consistente.|手动备份前请停止服务器，确保数据一致。|整合性のある手動バックアップのため、先に停止してください。|Для целостной ручной копии сначала останови сервер.
apiRequired|Configura una API compatible en Integraciones.|Configure a compatible API in Integrations.|Configure uma API compatível em Integrações.|请在集成中配置兼容的 API。|連携画面で互換APIを設定してください。|Настрой совместимый API в разделе интеграций.
branchUnavailable|Steam ya no ofrece esta rama. Actualiza las versiones y selecciona una disponible.|Steam no longer offers this branch. Refresh versions and choose an available one.|O Steam não oferece mais este ramo. Atualize e escolha um disponível.|Steam 不再提供此分支。请刷新版本并选择可用分支。|このブランチはSteamで提供されていません。更新して選び直してください。|Эта ветка больше недоступна. Обнови список и выбери доступную.
modExists|Ya existe un mod con ese nombre. Desactívalo o conserva su carpeta antes de sustituirlo.|A mod with this name already exists. Disable it or keep its folder before replacing it.|Já existe um mod com esse nome. Desative-o ou mantenha a pasta antes de substituir.|已存在同名模组，请先保留其文件夹再替换。|同名MODがあります。置換前にフォルダーを保管してください。|Мод с таким именем уже есть. Сохрани его папку перед заменой.
insufficientFunds|Saldo insuficiente.|Insufficient balance.|Saldo insuficiente.|余额不足。|残高不足です。|Недостаточно средств.
cooldown|Debes esperar antes de volver a usarlo.|Wait before using this again.|Aguarde antes de usar novamente.|请等待冷却结束。|再使用までお待ちください。|Подожди перед повторным использованием.
sharedDirectory|Cada servidor local necesita una carpeta independiente.|Each local server needs a separate folder.|Cada servidor local precisa de uma pasta independente.|每个本地服务器需要独立文件夹。|各サーバーには別のフォルダーが必要です。|Каждому серверу нужна отдельная папка.
invalidXml|El archivo no es un serverconfig.xml válido.|The file is not a valid serverconfig.xml.|O arquivo não é um serverconfig.xml válido.|文件不是有效的 serverconfig.xml。|有効なserverconfig.xmlではありません。|Файл не является допустимым serverconfig.xml.
connectionFailed|No se pudo conectar. Comprueba dirección, puerto y Telnet.|Could not connect. Check address, port and Telnet.|Não foi possível conectar. Verifique endereço, porta e Telnet.|无法连接，请检查地址、端口和 Telnet。|接続できません。アドレス・ポート・Telnetを確認してください。|Не удалось подключиться. Проверь адрес, порт и Telnet.
badPassword|La contraseña de Telnet es incorrecta.|Incorrect Telnet password.|Senha do Telnet incorreta.|Telnet 密码错误。|Telnetパスワードが違います。|Неверный пароль Telnet.
shutdownTimeout|El apagado tarda más de lo esperado. Revisa la consola; puedes forzar el cierre si no responde.|Shutdown is taking longer than expected. Check the console; force stop is available if unresponsive.|O desligamento está demorando. Verifique o console; você pode forçar se não responder.|关闭超时，请检查控制台。无响应时可强制停止。|停止に時間がかかっています。コンソールを確認し、応答しない場合は強制終了できます。|Остановка затянулась. Проверь консоль; при зависании можно завершить принудительно.
portInUse|Otro programa está usando este puerto.|Another program is using this port.|Outro programa está usando esta porta.|其他程序正在使用此端口。|別のプログラムがこのポートを使用中です。|Этот порт занят другой программой.
missingModInfo|No se encontró ModInfo.xml dentro de la carpeta o ZIP.|No ModInfo.xml found in the folder or ZIP.|ModInfo.xml não encontrado na pasta ou ZIP.|文件夹或 ZIP 内未找到 ModInfo.xml。|フォルダーまたはZIP内にModInfo.xmlがありません。|В папке или ZIP не найден ModInfo.xml.
unsafeArchive|El archivo contiene rutas o enlaces no seguros y no se ha importado.|The archive contains unsafe paths or links and was not imported.|O arquivo contém caminhos ou links inseguros e não foi importado.|压缩包包含不安全的路径或链接，未导入。|安全でないパスやリンクがあるため取り込みませんでした。|Архив содержит небезопасные пути или ссылки и не импортирован.
exitStop|Detén los servidores y espera a que terminen las tareas antes de salir.|Stop servers and wait for tasks to finish before exiting.|Pare os servidores e aguarde as tarefas antes de sair.|退出前请停止服务器并等待任务完成。|終了前にサーバーを停止し、処理完了をお待ちください。|Перед выходом останови серверы и дождись завершения задач.
exit|Salir|Exit|Sair|退出|終了|Выход
health|Supervisión|Monitoring|Monitoramento|监控|監視|Мониторинг
webEnable|Panel web activado|Web dashboard enabled|Painel web ativado|启用网页面板|Webパネルを有効化|Веб-панель включена
mapEnable|Generar imágenes del mapa|Render map tiles|Gerar imagens do mapa|生成地图瓦片|マップタイルを生成|Создавать тайлы карты
deliver|Entregar bolsa|Deliver bag|Entregar bolsa|发放奖励包|報酬袋を配布|Выдать набор
securitySection|Protección|Protection|Proteção|保护|保護|Защита
review|Revisar|Review|Revisar|待审核|要確認|Проверить
pending|Pendiente|Pending|Pendente|待处理|保留中|Ожидает
delivered|Entregado|Delivered|Entregue|已交付|配布済み|Выдано
customBranch|Rama exacta|Exact branch|Ramo exato|准确分支名|正確なブランチ名|Точная ветка
copyAddress|Copiar dirección|Copy address|Copiar endereço|复制地址|アドレスをコピー|Копировать адрес
copied|Dirección copiada|Address copied|Endereço copiado|地址已复制|コピーしました|Адрес скопирован
cancelled|Cancelado|Cancelled|Cancelado|已取消|キャンセル済み|Отменено
clientVersion|Los jugadores deben utilizar la misma versión del servidor.|Players must use the same version as the server.|Os jogadores devem usar a mesma versão do servidor.|玩家必须使用与服务器相同的版本。|プレイヤーもサーバーと同じバージョンが必要です。|Игрокам нужна та же версия, что и на сервере.
notice|Información|Information|Informação|信息|情報|Информация
minutesPlayed|Minutos conectado|Minutes online|Minutos conectado|在线分钟|オンライン時間（分）|Минут онлайн
healthRestart|Reiniciar si la consola deja de responder|Restart if console stops responding|Reiniciar se o console parar de responder|控制台无响应时重启|コンソール無応答時に再起動|Перезапуск при зависании консоли
avoidBloodMoon|Evitar reinicios durante luna de sangre|Avoid restarts during blood moon|Evitar reinícios na lua de sangue|血月期间避免重启|ブラッドムーン中の再起動を避ける|Не перезапускать во время кровавой луны
`;
for (const line of words.trim().split("\n")) {
  const [key, ...values] = line.split("|");
  for (let i = 0; i < languages.length; i++)
    (window.I18N[languages[i]] ??= {})[key] = values[i] || values[1] || key;
}
window.t = (key) =>
  window.I18N[window.currentLanguage || "es"]?.[key] ||
  window.I18N.en[key] ||
  key;
const extra = `
visibility|Visibilidad|Visibility|Visibilidade|可见性|公開範囲|Видимость
public|Público|Public|Público|公开|公開|Публичный
friends|Amigos|Friends|Amigos|好友|フレンド|Друзья
private|No listado|Unlisted|Não listado|不列出|非公開|Скрытый
region|Región|Region|Região|地区|地域|Регион
description|Descripción|Description|Descrição|描述|説明|Описание
rules|Reglas al entrar|Join rules|Regras ao entrar|加入规则|参加時のルール|Правила входа
stopHelp|Se guardará el mundo y se apagará el servidor. Los jugadores se desconectarán.|The world will be saved and the server shut down. Players will disconnect.|O mundo será salvo e o servidor desligado. Os jogadores serão desconectados.|将保存世界并关闭服务器，玩家会断开连接。|ワールドを保存し、サーバーを停止します。プレイヤーは切断されます。|Мир сохранится и сервер остановится. Игроки будут отключены.
removeEntryHelp|¿Quieres quitar este elemento?|Remove this entry?|Deseja remover este item?|移除此条目？|この項目を削除しますか？|Убрать эту запись?
backup|Copia de seguridad|Backup|Cópia de segurança|备份|バックアップ|Резервная копия
event|Acciones de evento|Event actions|Ações do evento|事件操作|イベント操作|Действия события
joined|Jugador conectado|Player joined|Jogador conectado|玩家加入|プレイヤー接続|Игрок вошёл
left|Jugador desconectado|Player left|Jogador desconectado|玩家离开|プレイヤー切断|Игрок вышел
log|Línea del registro|Log line|Linha do registro|日志行|ログ行|Строка журнала
backupStarted|Copia iniciada|Backup started|Cópia iniciada|备份开始|バックアップ開始|Копирование началось
backupCompleted|Copia completada|Backup completed|Cópia concluída|备份完成|バックアップ完了|Копирование завершено
backupFailed|Copia fallida|Backup failed|Cópia falhou|备份失败|バックアップ失敗|Ошибка копирования
discordConnected|Discord conectado|Discord connected|Discord conectado|Discord 已连接|Discord接続|Discord подключён
discordChat|Mensaje de Discord|Discord message|Mensagem do Discord|Discord 消息|Discordメッセージ|Сообщение Discord
pingFailed|Ping excesivo|High ping|Ping excessivo|延迟过高|Ping超過|Высокий пинг
vacFailed|Sanción VAC detectada|VAC ban detected|Banimento VAC detectado|检测到 VAC 封禁|VAC検出|Обнаружена блокировка VAC
death|Jugador muerto|Player died|Jogador morreu|玩家死亡|プレイヤー死亡|Игрок погиб
killZombie|Zombi eliminado|Zombie killed|Zumbi morto|击杀僵尸|ゾンビ撃破|Зомби убит
killPlayer|Jugador eliminado|Player killed|Jogador morto|击杀玩家|プレイヤー撃破|Игрок убит
invalidData|Comprueba los valores introducidos.|Check the entered values.|Verifique os valores inseridos.|请检查输入值。|入力内容を確認してください。|Проверь введённые значения.
invalidInterval|Indica un intervalo o fecha válidos.|Enter a valid interval or date.|Informe um intervalo ou data válidos.|请输入有效间隔或日期。|有効な間隔または日時を入力してください。|Укажи допустимый интервал или дату.
cpu|Uso de CPU|CPU usage|Uso de CPU|CPU 使用率|CPU使用率|Загрузка CPU
memory|Memoria RAM|RAM usage|Memória RAM|内存占用|RAM使用量|Память RAM
maxMemory|Límite de RAM (MB; 0 sin límite)|RAM limit (MB; 0 unlimited)|Limite de RAM (MB; 0 ilimitado)|内存上限（MB；0 为不限）|RAM上限（MB、0で無制限）|Лимит RAM (МБ; 0 без лимита)
home|Ubicaciones personales|Personal locations|Locais pessoais|个人地点|個人の地点|Личные точки
hostCheck|Bloquear países o direcciones|Block countries or addresses|Bloquear países ou endereços|屏蔽国家或地址|国・アドレスを制限|Блокировать страны или адреса
banItems|Objetos prohibidos|Banned items|Itens proibidos|禁用物品|禁止アイテム|Запрещённые предметы
`;
for (const line of extra.trim().split("\n")) {
  const [key, ...values] = line.split("|");
  for (let i = 0; i < languages.length; i++)
    window.I18N[languages[i]][key] = values[i] || values[1] || key;
}
const more = `
order|Orden de ejecución|Execution order|Ordem de execução|执行顺序|実行順序|Порядок выполнения
file|Registro del juego|Game log|Registro do jogo|游戏日志|ゲームログ|Журнал игры
steam|Instalación Steam|Steam installation|Instalação Steam|Steam 安装|Steamインストール|Установка Steam
process|Proceso del servidor|Server process|Processo do servidor|服务器进程|サーバープロセス|Процесс сервера
serverReady|Mundo cargado|World ready|Mundo carregado|世界加载完成|ワールド読込完了|Мир загружен
bloodmoonStarted|Luna de sangre iniciada|Blood moon started|Lua de sangue iniciada|血月开始|ブラッドムーン開始|Кровавая луна началась
bloodmoonEnded|Luna de sangre terminada|Blood moon ended|Lua de sangue encerrada|血月结束|ブラッドムーン終了|Кровавая луна закончилась
connecting|Jugador entrando|Player connecting|Jogador entrando|玩家连接中|プレイヤー接続中|Игрок подключается
spawnJoin|Jugador aparece al entrar|Player spawned on join|Jogador aparece ao entrar|玩家加入后生成|参加時のスポーン|Игрок появился при входе
spawnDeath|Jugador reaparece tras morir|Player respawned after death|Jogador reaparece após morrer|玩家死亡后重生|死亡後のリスポーン|Игрок возродился после смерти
spawnTeleport|Jugador llega por teletransporte|Player arrived by teleport|Jogador chega por teleporte|玩家传送到达|テレポートで到着|Игрок прибыл телепортом
playerKicked|Jugador expulsado|Player kicked|Jogador expulso|玩家被踢出|プレイヤーをキック|Игрок выгнан
playerBanned|Jugador bloqueado|Player banned|Jogador banido|玩家被封禁|プレイヤーをBAN|Игрок заблокирован
playerUnbanned|Bloqueo retirado|Player unbanned|Jogador desbanido|玩家已解封|BANを解除|Игрок разблокирован
permissionsUpdated|Permisos actualizados|Permissions updated|Permissões atualizadas|权限已更新|権限更新|Права обновлены
airdrop|Airdrop generado|Airdrop spawned|Airdrop gerado|空投生成|エアドロップ出現|Появился груз
hordeStarted|Horda iniciada|Horde started|Horda iniciada|尸潮开始|群れの開始|Орда появилась
hordeEnded|Horda terminada|Horde ended|Horda encerrada|尸潮结束|群れの終了|Орда закончилась
hordeTarget|Horda encuentra objetivo|Horde found target|Horda encontra alvo|尸潮发现目标|群れが対象を検出|Орда нашла цель
screamer|Gritona generada|Screamer spawned|Gritadora gerada|尖叫者生成|スクリーマー出現|Появилась крикунья
clientCommandDenied|Comando de cliente denegado|Client command denied|Comando do cliente negado|客户端命令被拒绝|クライアントコマンド拒否|Команда клиента отклонена
clientCommandExecuted|Comando de cliente ejecutado|Client command executed|Comando do cliente executado|客户端命令已执行|クライアントコマンド実行|Команда клиента выполнена
animalKilled|Animal eliminado|Animal killed|Animal morto|击杀动物|動物を倒した|Животное убито
cpmZombieKilled|CPM: zombi eliminado|CPM: zombie killed|CPM: zumbi morto|CPM：击杀僵尸|CPM: ゾンビ撃破|CPM: зомби убит
cpmPlayerKilled|CPM: jugador eliminado|CPM: player killed|CPM: jogador morto|CPM：击杀玩家|CPM: プレイヤー撃破|CPM: игрок убит
cpmPlayerDied|CPM: jugador muerto|CPM: player died|CPM: jogador morreu|CPM：玩家死亡|CPM: プレイヤー死亡|CPM: игрок погиб
cpmPlayerLeveled|CPM: subida de nivel|CPM: player leveled up|CPM: jogador subiu de nível|CPM：玩家升级|CPM: レベルアップ|CPM: повышение уровня
cpmKilledByEntity|CPM: muerte por entidad|CPM: killed by entity|CPM: morto por entidade|CPM：被实体击杀|CPM: エンティティによる死亡|CPM: убит сущностью
playerList|Lista de jugadores actualizada|Player list updated|Lista de jogadores atualizada|玩家列表已更新|プレイヤー一覧更新|Список игроков обновлён
timer|Cada segundo|Every second|A cada segundo|每秒|毎秒|Каждую секунду
shutdownSecond|Cuenta atrás: segundos|Countdown: seconds|Contagem: segundos|倒计时：秒|カウントダウン: 秒|Отсчёт: секунды
shutdownMinute|Cuenta atrás: minutos|Countdown: minutes|Contagem: minutos|倒计时：分钟|カウントダウン: 分|Отсчёт: минуты
shutdownNow|Apagado inmediato|Shutdown now|Desligar agora|立即关闭|今すぐ停止|Остановка сейчас
shutdownCancelled|Apagado cancelado|Shutdown cancelled|Desligamento cancelado|关闭已取消|停止を取り消した|Остановка отменена
serverRestart|Servidor reiniciado|Server restarted|Servidor reiniciado|服务器已重启|サーバー再起動|Сервер перезапущен
discordDisconnected|Discord desconectado|Discord disconnected|Discord desconectado|Discord 已断开|Discord切断|Discord отключён
areaEntered|Jugador entra en una zona|Player entered an area|Jogador entrou numa área|玩家进入区域|プレイヤーがエリアに進入|Игрок вошёл в зону
hostFailed|Dirección bloqueada|Blocked address|Endereço bloqueado|地址被屏蔽|制限アドレス|Адрес заблокирован
bannedItem|Objeto prohibido detectado|Banned item detected|Item proibido detectado|检测到禁用物品|禁止アイテム検出|Найден запрещённый предмет
healthFailed|Servidor sin respuesta|Server unresponsive|Servidor sem resposta|服务器无响应|サーバー無応答|Сервер не отвечает
ramFailed|Límite de RAM superado|RAM limit exceeded|Limite de RAM excedido|超出内存上限|RAM上限超過|Превышен лимит RAM
remoteRestartUnsupported|El reinicio de un servidor remoto debe configurarse en el equipo que lo aloja. Puedes apagarlo por Telnet.|Remote server restart must be configured on its host. You can shut it down through Telnet.|O reinício remoto deve ser configurado na máquina que hospeda. Você pode desligá-lo por Telnet.|远程服务器重启须在主机配置，可通过 Telnet 关闭。|リモート再起動はホスト側で設定が必要です。Telnetでの停止は可能です。|Перезапуск удалённого сервера настраивается на хосте. Через Telnet его можно остановить.
`;
for (const line of more.trim().split("\n")) {
  const [key, ...values] = line.split("|");
  for (let i = 0; i < languages.length; i++)
    window.I18N[languages[i]][key] = values[i] || values[1] || key;
}
const native = `
ServerName|Nombre del servidor|Server name|Nome do servidor|服务器名称|サーバー名|Название сервера
ServerDescription|Descripción del servidor|Server description|Descrição do servidor|服务器描述|サーバーの説明|Описание сервера
ServerWebsiteURL|Página web|Website|Página web|网站|Webサイト|Сайт
ServerPassword|Contraseña de acceso|Join password|Senha de acesso|加入密码|参加パスワード|Пароль входа
ServerLoginConfirmationText|Reglas al entrar|Join rules|Regras ao entrar|加入规则|参加時のルール|Правила входа
Region|Región|Region|Região|地区|地域|Регион
Language|Idioma del servidor|Server language|Idioma do servidor|服务器语言|サーバー言語|Язык сервера
ServerPort|Puerto del juego|Game port|Porta do jogo|游戏端口|ゲームポート|Порт игры
ServerVisibility|Visibilidad|Visibility|Visibilidade|可见性|公開範囲|Видимость
ServerDisabledNetworkProtocols|Protocolos de red desactivados|Disabled network protocols|Protocolos de rede desativados|禁用的网络协议|無効なネットワーク方式|Отключённые протоколы
ServerMaxWorldTransferSpeedKiBs|Velocidad máxima de descarga del mundo|Maximum world transfer speed|Velocidade máxima de transferência do mundo|世界最大传输速度|ワールド転送速度上限|Скорость передачи мира
ServerMaxPlayerCount|Máximo de jugadores|Maximum players|Máximo de jogadores|玩家人数上限|最大プレイヤー数|Максимум игроков
ServerReservedSlots|Plazas reservadas|Reserved slots|Vagas reservadas|保留名额|予約スロット数|Резервные слоты
ServerReservedSlotsPermission|Permiso para plazas reservadas|Reserved slot permission|Permissão de vagas reservadas|保留名额权限|予約スロットの権限|Права на резервные слоты
ServerAdminSlots|Plazas de administradores|Admin slots|Vagas de administradores|管理员名额|管理者スロット数|Слоты администраторов
ServerAdminSlotsPermission|Permiso de plazas de administrador|Admin slot permission|Permissão das vagas de administrador|管理员名额权限|管理者スロットの権限|Права на слоты администраторов
WebDashboardEnabled|Activar panel web|Enable web dashboard|Ativar painel web|启用网页面板|Webパネルを有効化|Включить веб-панель
WebDashboardPort|Puerto del panel web|Web dashboard port|Porta do painel web|网页面板端口|Webパネルのポート|Порт веб-панели
WebDashboardUrl|Dirección del panel web|Web dashboard address|Endereço do painel web|网页面板地址|WebパネルのURL|Адрес веб-панели
EnableMapRendering|Generar imágenes del mapa|Render map tiles|Gerar imagens do mapa|生成地图瓦片|マップタイルを生成|Создавать тайлы карты
TelnetEnabled|Activar consola Telnet|Enable Telnet console|Ativar console Telnet|启用 Telnet 控制台|Telnetを有効化|Включить Telnet
TelnetPort|Puerto de Telnet|Telnet port|Porta do Telnet|Telnet 端口|Telnetポート|Порт Telnet
TelnetPassword|Contraseña de Telnet|Telnet password|Senha do Telnet|Telnet 密码|Telnetパスワード|Пароль Telnet
TelnetFailedLoginLimit|Intentos de acceso permitidos|Allowed login attempts|Tentativas de acesso permitidas|允许的登录尝试次数|ログイン試行上限|Попыток входа
TelnetFailedLoginsBlocktime|Bloqueo tras fallos de acceso (segundos)|Login failure block time (seconds)|Bloqueio após falhas de acesso (segundos)|登录失败屏蔽时间（秒）|ログイン失敗時の制限秒数|Блокировка после ошибок (сек.)
AdminFileName|Archivo de administradores|Admin file|Arquivo de administradores|管理员文件|管理者ファイル|Файл администраторов
ServerAllowCrossplay|Juego entre plataformas|Crossplay|Jogo entre plataformas|跨平台游戏|クロスプレイ|Кроссплей
EACEnabled|Activar Easy Anti-Cheat|Enable Easy Anti-Cheat|Ativar Easy Anti-Cheat|启用 Easy Anti-Cheat|Easy Anti-Cheatを有効化|Включить Easy Anti-Cheat
IgnoreEOSSanctions|Ignorar sanciones EOS|Ignore EOS sanctions|Ignorar sanções EOS|忽略 EOS 制裁|EOS制裁を無視|Игнорировать санкции EOS
HideCommandExecutionLog|Ocultar registro de comandos|Hide command log|Ocultar registro de comandos|隐藏命令日志|コマンド履歴を非表示|Скрывать журнал команд
MaxUncoveredMapChunksPerPlayer|Límite de mapa explorado por jugador|Map discovery limit per player|Limite de mapa explorado por jogador|每位玩家地图探索上限|プレイヤーごとの探索上限|Лимит открытой карты на игрока
PersistentPlayerProfiles|Mantener perfil del jugador|Persistent player profiles|Manter perfil do jogador|持久玩家档案|プレイヤープロフィールを維持|Постоянные профили игроков
MaxChunkAge|Días para reiniciar zonas sin visitar|Unvisited chunk reset days|Dias para reiniciar áreas não visitadas|未访问区块重置天数|未訪問チャンクのリセット日数|Дней до сброса непосещённых зон
SaveDataLimit|Límite del guardado (MB)|Save data limit (MB)|Limite dos dados salvos (MB)|存档大小上限（MB）|セーブ容量上限（MB）|Лимит сохранения (МБ)
GameWorld|Mundo|World|Mundo|世界|ワールド|Мир
WorldGenSeed|Semilla de generación|Generation seed|Semente de geração|生成种子|生成シード|Сид генерации
WorldGenSize|Tamaño del mundo|World size|Tamanho do mundo|世界大小|ワールドサイズ|Размер мира
GameName|Nombre de la partida|Save name|Nome da partida|存档名称|セーブ名|Название сохранения
GameMode|Modo de juego|Game mode|Modo de jogo|游戏模式|ゲームモード|Режим игры
PlayerSafeZoneLevel|Nivel de protección inicial|Initial protection level|Nível de proteção inicial|新手保护等级|初期保護のレベル|Уровень начальной защиты
PlayerSafeZoneHours|Horas de protección inicial|Initial protection hours|Horas de proteção inicial|新手保护小时数|初期保護の時間|Часов начальной защиты
BuildCreate|Modo creativo|Creative mode|Modo criativo|创造模式|クリエイティブモード|Творческий режим
BedrollDeadZoneSize|Radio de protección del saco|Bedroll protection radius|Raio de proteção do saco|睡袋保护范围|寝袋の保護範囲|Радиус защиты спальника
BedrollExpiryTime|Caducidad del saco (días)|Bedroll expiry (days)|Validade do saco (dias)|睡袋有效期（天）|寝袋の有効日数|Срок спальника (дни)
AllowSpawnNearFriend|Aparecer cerca de amigos|Spawn near friends|Aparecer perto de amigos|在好友附近生成|フレンド付近にスポーン|Появляться рядом с друзьями
CameraRestrictionMode|Modo de cámara|Camera mode|Modo de câmera|镜头模式|カメラ制限|Режим камеры
MaxSpawnedZombies|Máximo de zombis|Maximum zombies|Máximo de zumbis|僵尸数量上限|ゾンビ数上限|Максимум зомби
MaxSpawnedAnimals|Máximo de animales|Maximum animals|Máximo de animais|动物数量上限|動物数上限|Максимум животных
ServerMaxAllowedViewDistance|Distancia de visión máxima|Maximum view distance|Distância máxima de visão|最大视距|最大描画距離|Максимальная дальность обзора
MaxQueuedMeshLayers|Capas de terreno en espera|Queued mesh layers|Camadas de terreno na fila|排队网格层数|メッシュ待機レイヤー数|Слоёв сетки в очереди
PartySharedKillRange|Distancia de experiencia compartida|Shared XP range|Distância de experiência compartilhada|共享经验范围|経験値共有範囲|Дальность общего опыта
PlayerKillingMode|Daño entre jugadores|Player killing mode|Dano entre jogadores|玩家伤害模式|プレイヤー間ダメージ|Урон между игроками
LandClaimCount|Máximo de reclamaciones|Maximum land claims|Máximo de reivindicações|领地石数量上限|土地請求数上限|Максимум участков
LandClaimSize|Tamaño de la zona protegida|Claim area size|Tamanho da área protegida|领地保护大小|保護エリアの広さ|Размер защищённой зоны
LandClaimDeadZone|Separación entre reclamaciones|Claim separation|Separação entre reivindicações|领地间隔|土地請求の間隔|Расстояние между участками
LandClaimExpiryTime|Caducidad de protección (días)|Claim expiry (days)|Validade da proteção (dias)|领地保护有效期（天）|土地保護の有効日数|Срок защиты участка (дни)
LandClaimDecayMode|Pérdida de protección|Claim decay mode|Decaimento da proteção|领地衰减模式|保護の減衰方式|Ослабление защиты
LandClaimOnlineDurabilityModifier|Resistencia con jugador conectado|Online claim durability|Resistência com jogador conectado|在线领地耐久|オンライン時の耐久倍率|Прочность при игроке онлайн
LandClaimOfflineDurabilityModifier|Resistencia con jugador desconectado|Offline claim durability|Resistência com jogador desconectado|离线领地耐久|オフライン時の耐久倍率|Прочность при игроке офлайн
LandClaimOfflineDelay|Retraso de protección sin conexión|Offline protection delay|Atraso da proteção offline|离线保护延迟|オフライン保護の遅延|Задержка офлайн-защиты
DynamicMeshEnabled|Terreno dinámico|Dynamic mesh|Terreno dinâmico|动态网格|ダイナミックメッシュ|Динамическая сетка
DynamicMeshLandClaimOnly|Terreno dinámico solo en reclamaciones|Dynamic mesh in claims only|Terreno dinâmico só em áreas protegidas|仅领地启用动态网格|土地請求内のみ有効|Динамическая сетка только на участках
DynamicMeshLandClaimBuffer|Margen del terreno dinámico|Dynamic mesh claim buffer|Margem do terreno dinâmico|动态网格缓冲范围|ダイナミックメッシュの余白|Буфер динамической сетки
DynamicMeshMaxItemCache|Caché del terreno dinámico|Dynamic mesh item cache|Cache do terreno dinâmico|动态网格缓存|ダイナミックメッシュのキャッシュ|Кэш динамической сетки
TwitchServerPermission|Permiso de Twitch|Twitch permission|Permissão do Twitch|Twitch 权限|Twitchの権限|Права Twitch
TwitchBloodMoonAllowed|Permitir Twitch en luna de sangre|Allow Twitch during blood moon|Permitir Twitch na lua de sangue|血月期间允许 Twitch|ブラッドムーン中のTwitchを許可|Twitch во время кровавой луны
SandboxCode|Código de reglas de la partida|Sandbox rules code|Código das regras da partida|沙盒规则代码|サンドボックス設定コード|Код правил песочницы
GameDifficulty|Dificultad|Difficulty|Dificuldade|难度|難易度|Сложность
BlockDamagePlayer|Daño de jugadores a bloques|Player block damage|Dano dos jogadores a blocos|玩家方块伤害|プレイヤーのブロックダメージ|Урон игроков по блокам
BlockDamageAI|Daño de zombis a bloques|Zombie block damage|Dano dos zumbis a blocos|僵尸方块伤害|ゾンビのブロックダメージ|Урон зомби по блокам
BlockDamageAIBM|Daño de bloques en luna de sangre|Blood moon block damage|Dano a blocos na lua de sangue|血月方块伤害|ブラッドムーンのブロックダメージ|Урон по блокам в кровавую луну
XPMultiplier|Multiplicador de experiencia|XP multiplier|Multiplicador de experiência|经验倍率|経験値倍率|Множитель опыта
DayNightLength|Duración del día (minutos)|Day length (minutes)|Duração do dia (minutos)|一天时长（分钟）|1日の長さ（分）|Длительность дня (минуты)
DayLightLength|Horas de luz|Daylight hours|Horas de luz|白天小时数|日照時間|Световой день (часы)
DropOnDeath|Pérdida de objetos al morir|Items dropped on death|Itens perdidos ao morrer|死亡掉落|死亡時のドロップ|Потеря предметов при смерти
DropOnQuit|Pérdida de objetos al salir|Items dropped on quit|Itens perdidos ao sair|退出掉落|退出時のドロップ|Потеря предметов при выходе
LootAbundance|Abundancia de botín|Loot abundance|Abundância de saque|战利品丰度|戦利品の量|Количество добычи
LootRespawnDays|Días para regenerar botín|Loot respawn days|Dias para renovar saque|战利品重生天数|戦利品の復活日数|Дней до обновления добычи
AirDropFrequency|Frecuencia de airdrops|Airdrop frequency|Frequência de airdrops|空投频率|エアドロップ頻度|Частота грузов
AirDropMarker|Marcar airdrops en el mapa|Mark airdrops on map|Marcar airdrops no mapa|地图显示空投|マップにエアドロップを表示|Отмечать грузы на карте
BloodMoonFrequency|Días entre lunas de sangre|Days between blood moons|Dias entre luas de sangue|血月间隔天数|ブラッドムーンの間隔日数|Дней между кровавыми лунами
BloodMoonRange|Variación de luna de sangre|Blood moon variation|Variação da lua de sangue|血月随机范围|ブラッドムーンの変動幅|Разброс кровавой луны
BloodMoonEnemyCount|Zombis por jugador en luna de sangre|Blood moon zombies per player|Zumbis por jogador na lua de sangue|血月每位玩家僵尸数|ブラッドムーンの1人あたりゾンビ数|Зомби на игрока в кровавую луну
ZombieMove|Velocidad de zombis de día|Day zombie speed|Velocidade dos zumbis de dia|白天僵尸速度|昼のゾンビ速度|Скорость зомби днём
ZombieMoveNight|Velocidad de zombis de noche|Night zombie speed|Velocidade dos zumbis à noite|夜晚僵尸速度|夜のゾンビ速度|Скорость зомби ночью
ZombieFeralMove|Velocidad de zombis ferales|Feral zombie speed|Velocidade dos zumbis ferozes|狂暴僵尸速度|フェラルの速度|Скорость одичавших зомби
ZombieBMMove|Velocidad de zombis en luna de sangre|Blood moon zombie speed|Velocidade dos zumbis na lua de sangue|血月僵尸速度|ブラッドムーンのゾンビ速度|Скорость зомби в кровавую луну
EnemySpawnMode|Generar enemigos|Spawn enemies|Gerar inimigos|生成敌人|敵の出現|Появление врагов
EnemyDifficulty|Resistencia de enemigos|Enemy toughness|Resistência dos inimigos|敌人强度|敵の耐久|Прочность врагов
ZombieFeralSense|Sentidos de los ferales|Feral sense|Sentidos dos ferozes|狂暴感知|フェラル感知|Чутьё одичавших
DeathPenalty|Penalización por muerte|Death penalty|Penalidade por morte|死亡惩罚|死亡ペナルティ|Штраф за смерть
`;
for (const line of native.trim().split("\n")) {
  const [key, ...values] = line.split("|");
  for (let i = 0; i < languages.length; i++)
    window.I18N[languages[i]][key] = values[i] || values[1] || key;
}
const finalWords = `
backupVersionMismatch|La copia pertenece a otra rama del juego. Instala esa rama antes de restaurar el mundo.|This backup belongs to a different game branch. Install that branch before restoring the world.|A cópia pertence a outro ramo do jogo. Instale esse ramo antes de restaurar o mundo.|备份属于其他游戏分支，请先安装对应分支。|異なるゲームブランチのバックアップです。対応ブランチを先にインストールしてください。|Копия относится к другой ветке игры. Сначала установи её.
applyGroup|Aplicar permisos|Apply permissions|Aplicar permissões|应用权限|権限を適用|Применить права
applyGroupHelp|Se asignará el nivel de permiso del grupo a todos sus miembros en el servidor.|The group's permission level will be assigned to every member on the server.|O nível de permissão do grupo será atribuído a todos os membros no servidor.|将为服务器上所有群组成员分配该权限等级。|サーバー上の全メンバーにグループの権限を付与します。|Всем участникам группы будет выдан её уровень прав.
transfer|Transferir monedas|Transfer coins|Transferir moedas|转账金币|コインを送金|Перевести монеты
sender|ID de origen|Sender ID|ID de origem|发送方 ID|送信元ID|ID отправителя
receiver|ID de destino|Recipient ID|ID de destino|接收方 ID|送信先ID|ID получателя
votes|Historial de votos|Vote history|Histórico de votos|投票历史|投票履歴|История голосов
currentMonth|Mes actual|Current month|Mês atual|本月|今月|Текущий месяц
previousMonth|Mes anterior|Previous month|Mês anterior|上月|先月|Предыдущий месяц
period|Periodo|Period|Período|时间段|期間|Период
slot|Ranura|Slot|Espaço|槽位|スロット|Ячейка
changes|Cambio de cantidad|Quantity change|Alteração de quantidade|数量变化|数量の変化|Изменение количества
snapshot|Lectura del inventario|Inventory snapshot|Leitura do inventário|物品栏快照|インベントリ取得|Снимок инвентаря
invalidPlayer|Introduce un ID Steam, EOS o una entidad numérica válidos.|Enter a valid Steam ID, EOS ID or numeric entity ID.|Insira um ID Steam, EOS ou entidade numérica válido.|请输入有效的 Steam、EOS 或数字实体 ID。|有効なSteam・EOS・数値のエンティティIDを入力してください。|Введи допустимый Steam ID, EOS ID или числовой ID сущности.
invalidPosition|Introduce tres coordenadas numéricas separadas por comas: x, y, z.|Enter three numeric coordinates separated by commas: x, y, z.|Insira três coordenadas numéricas separadas por vírgulas: x, y, z.|请输入三个逗号分隔的数字坐标：x,y,z。|数値の座標をカンマ区切りで入力してください: x,y,z。|Введи три координаты через запятую: x,y,z.
invalidPort|Los puertos deben ser números entre 1024 y 65532.|Ports must be numbers between 1024 and 65532.|As portas devem ser números entre 1024 e 65532.|端口必须在 1024 到 65532 之间。|ポートは1024〜65532の数値にしてください。|Порты должны быть от 1024 до 65532.
invalidGameName|El nombre de la partida solo admite letras latinas, números, espacios, guiones, puntos y guiones bajos.|The save name only accepts Latin letters, numbers, spaces, hyphens, dots and underscores.|O nome da partida só aceita letras latinas, números, espaços, hífens, pontos e sublinhados.|存档名仅支持拉丁字母、数字、空格、连字符、句点及下划线。|セーブ名は英数字・空白・ハイフン・ピリオド・下線のみ使用できます。|Имя сохранения допускает латиницу, цифры, пробелы, дефисы, точки и подчёркивания.
invalidSlots|Selecciona entre 1 y 128 plazas.|Choose between 1 and 128 player slots.|Escolha entre 1 e 128 vagas.|请选择 1 到 128 个玩家名额。|人数は1〜128にしてください。|Выбери от 1 до 128 слотов.
invalidScript|Revisa las instrucciones y los bloques if / endif o loop / endloop del evento.|Check event instructions and if / endif or loop / endloop blocks.|Revise as instruções e blocos if / endif ou loop / endloop do evento.|请检查事件指令与 if/endif、loop/endloop 代码块。|イベントの命令とif/endif・loop/endloopを確認してください。|Проверь инструкции и блоки if/endif или loop/endloop.
`;
for (const line of finalWords.trim().split("\n")) {
  const [key, ...values] = line.split("|");
  for (let i = 0; i < languages.length; i++)
    window.I18N[languages[i]][key] = values[i] || values[1] || key;
}
const additions = `
areas|Zonas y avisos|Areas & alerts|Áreas e alertas|区域和提醒|エリアと通知|Зоны и оповещения
radius|Radio de la zona (bloques)|Area radius (blocks)|Raio da área (blocos)|区域半径（方块）|エリア半径（ブロック）|Радиус зоны (блоки)
blockedHosts|Direcciones o redes bloqueadas (una por línea)|Blocked addresses or networks (one per line)|Endereços ou redes bloqueados (um por linha)|屏蔽地址或网段（每行一个）|制限するアドレス・ネットワーク（1行1件）|Заблокированные адреса или сети (по одному в строке)
bannedItemsEnabled|Comprobar objetos prohibidos mediante la API|Check banned items through the API|Verificar itens proibidos pela API|通过 API 检查禁用物品|APIで禁止アイテムを確認|Проверять запрещённые предметы через API
personalLocations|Ubicaciones por jugador|Player locations|Locais por jogador|玩家个人地点|プレイヤーの地点|Точки игроков
maxHomes|Ubicaciones guardadas por jugador|Saved locations per player|Locais salvos por jogador|每位玩家可保存地点数|プレイヤーごとの保存地点数|Сохранённых точек на игрока
locationHelp|Los jugadores usan !sethome nombre, !home nombre, !delhome nombre y !homes. También pueden transferir monedas con !pay jugador cantidad.|Players use !sethome name, !home name, !delhome name and !homes. They can transfer coins with !pay player amount.|Jogadores usam !sethome nome, !home nome, !delhome nome e !homes. Podem transferir moedas com !pay jogador quantidade.|玩家使用 !sethome 名称、!home 名称、!delhome 名称 和 !homes，也可通过 !pay 玩家 金额 转账。|!sethome 名前、!home 名前、!delhome 名前、!homesを使用。!pay プレイヤー 金額で送金もできます。|Игроки используют !sethome имя, !home имя, !delhome имя и !homes. Для перевода: !pay игрок сумма.
commandUnsupported|El servidor rechazó esta acción. Algunos comandos necesitan un mod compatible con la versión del juego.|The server rejected this action. Some commands require a mod compatible with the game version.|O servidor rejeitou esta ação. Alguns comandos exigem um mod compatível com a versão do jogo.|服务器拒绝此操作，部分命令需要兼容当前游戏版本的模组。|サーバーが操作を拒否しました。一部のコマンドは対応MODが必要です。|Сервер отклонил действие. Для некоторых команд нужен совместимый мод.
`;
for (const line of additions.trim().split("\n")) {
  const [key, ...values] = line.split("|");
  for (let i = 0; i < languages.length; i++)
    window.I18N[languages[i]][key] = values[i] || values[1] || key;
}
const optional = `
mailNotifications|Avisos por correo|Email notifications|Avisos por e-mail|邮件通知|メール通知|Уведомления по почте
smtpHost|Servidor SMTP|SMTP server|Servidor SMTP|SMTP 服务器|SMTPサーバー|Сервер SMTP
smtpPort|Puerto SMTP|SMTP port|Porta SMTP|SMTP 端口|SMTPポート|Порт SMTP
smtpUser|Usuario SMTP|SMTP username|Usuário SMTP|SMTP 用户名|SMTPユーザー名|Пользователь SMTP
smtpSecure|TLS desde el inicio (normalmente puerto 465)|TLS from connection start (usually port 465)|TLS desde o início (normalmente porta 465)|连接时启用 TLS（通常端口 465）|接続開始時からTLS（通常465番）|TLS с начала соединения (обычно порт 465)
mailFrom|Dirección del remitente|Sender email|E-mail do remetente|发件人邮箱|送信元メール|Адрес отправителя
mailTo|Dirección de destino|Recipient email|E-mail do destinatário|收件人邮箱|送信先メール|Адрес получателя
mailHelp|Configura una cuenta SMTP para usar la acción email en eventos. No se envía correo al guardar estos ajustes.|Configure an SMTP account to use the email action in events. Saving these settings sends no email.|Configure uma conta SMTP para a ação email nos eventos. Salvar estas opções não envia e-mail.|配置 SMTP 账户以在事件中使用 email 操作，保存设置不会发送邮件。|イベントのemail操作用にSMTPを設定します。保存時には送信されません。|Настрой SMTP для действия email в событиях. Сохранение настроек не отправляет писем.
programs|Programas externos|External programs|Programas externos|外部程序|外部プログラム|Внешние программы
programHelp|Añade un ejecutable y sus argumentos para usar program nombre en un evento. Solo se ejecutan los programas que actives aquí; no se interpreta una cadena de comandos de Windows.|Add an executable and arguments to use program name in an event. Only programs enabled here can run; no Windows command string is interpreted.|Adicione um executável e argumentos para usar program nome em um evento. Só executa programas ativados aqui; não interpreta comandos do Windows.|添加可执行文件和参数，在事件中使用 program 名称。仅运行此处启用的程序，不解析 Windows 命令字符串。|実行ファイルと引数を登録してイベントのprogram 名前で使用します。有効化したプログラムのみ実行します。|Добавь программу и аргументы для действия program имя. Запускаются только включённые программы; строка команд Windows не интерпретируется.
programFile|Archivo ejecutable (.exe)|Executable file (.exe)|Arquivo executável (.exe)|可执行文件（.exe）|実行ファイル（.exe）|Исполняемый файл (.exe)
programArgs|Argumentos (uno por línea)|Arguments (one per line)|Argumentos (um por linha)|参数（每行一个）|引数（1行1件）|Аргументы (по одному в строке)
programTimeout|Tiempo máximo (milisegundos)|Time limit (milliseconds)|Tempo máximo (milissegundos)|超时时间（毫秒）|制限時間（ミリ秒）|Ограничение времени (мс)
mailRequired|Configura y activa el correo en Integraciones.|Configure and enable email in Integrations.|Configure e ative o e-mail em Integrações.|请在集成中配置并启用邮件。|連携でメールを設定し有効にしてください。|Настрой и включи почту в разделе интеграций.
programRequired|Añade y activa ese programa en Integraciones.|Add and enable this program in Integrations.|Adicione e ative esse programa em Integrações.|请在集成中添加并启用该程序。|連携でプログラムを登録し有効にしてください。|Добавь и включи эту программу в разделе интеграций.
linkExpired|El código de enlace no existe, ha caducado o ya se usó.|The link code is invalid, expired or already used.|O código é inválido, expirou ou já foi usado.|绑定代码无效、已过期或已使用。|連携コードが無効・期限切れ・使用済みです。|Код привязки недействителен, истёк или уже использован.
locationLimit|Se ha alcanzado el máximo de ubicaciones personales.|The personal location limit has been reached.|O limite de locais pessoais foi atingido.|已达到个人地点数量上限。|個人地点の上限に達しました。|Достигнут лимит личных точек.
`;
for (const line of optional.trim().split("\n")) {
  const [key, ...values] = line.split("|");
  for (let i = 0; i < languages.length; i++)
    window.I18N[languages[i]][key] = values[i] || values[1] || key;
}

for (const [lang, label] of Object.entries({
  es: "Eliminar servidor",
  en: "Delete server",
  pt: "Excluir servidor",
  zh: "删除服务器",
  ja: "サーバーを削除",
  ru: "Удалить сервер",
}))
  window.I18N[lang].deleteServer = label;

const deletionWords = `
keepServerFiles|Conservar los archivos|Keep server files|Manter os arquivos|保留服务器文件|ファイルを保持|Сохранить файлы
keepServerFilesHelp|Elimina el servidor de la lista. Sus carpetas y mundos se conservarán.|Remove the server from the list. Its folders and worlds are kept.|Remove o servidor da lista. As pastas e mundos serão mantidos.|从列表中移除服务器，保留文件夹和世界。|一覧から削除し、フォルダーとワールドは保持します。|Убрать сервер из списка. Папки и миры сохранятся.
deleteServerFiles|Eliminar también los archivos|Also delete server files|Excluir também os arquivos|同时删除服务器文件|ファイルも削除|Удалить также файлы
deleteServerFilesHelp|Borra toda la carpeta del servidor, incluidos mundos, mods y configuración. Esta acción no se puede deshacer.|Delete the entire server folder, including worlds, mods and settings. This cannot be undone.|Exclui toda a pasta do servidor, incluindo mundos, mods e configurações. Não é possível desfazer.|删除整个服务器文件夹，包括世界、模组和配置。此操作无法撤销。|ワールド・MOD・設定を含むサーバーフォルダー全体を削除します。元に戻せません。|Удалить всю папку сервера, включая миры, моды и настройки. Это нельзя отменить.
serverFolderToDelete|Carpeta que se eliminará si eliges borrar los archivos:|Folder deleted if you choose to remove files:|Pasta a excluir se você optar por apagar os arquivos:|选择删除文件时将删除此文件夹：|ファイル削除を選択した場合の対象フォルダー：|Папка, которая будет удалена при выборе удаления файлов:
separateBackupsKept|Las copias guardadas fuera de esta carpeta se conservarán.|Backups stored outside this folder are kept.|As cópias salvas fora desta pasta serão mantidas.|保存在此文件夹之外的备份将保留。|このフォルダー外のバックアップは保持されます。|Копии за пределами этой папки сохранятся.
remoteFilesKept|Solo se quitará el perfil. Para borrar archivos de un servidor remoto, usa el equipo que lo aloja.|Only the profile is removed. Delete remote server files on the computer that hosts them.|Só o perfil será removido. Exclua os arquivos remotos no computador que os hospeda.|仅移除配置，请在托管远程服务器的计算机上删除文件。|プロフィールのみ削除します。リモートのファイルはホスト側で削除してください。|Удаляется только профиль. Файлы удалённого сервера удаляются на его хосте.
unsafeDeletion|Esta carpeta no se puede borrar desde el manager. Puedes quitar el perfil conservando los archivos.|This folder cannot be deleted by the manager. You can remove the profile and keep the files.|Esta pasta não pode ser excluída pelo manager. Você pode remover o perfil mantendo os arquivos.|管理器无法删除此文件夹，可以移除配置并保留文件。|このフォルダーは削除できません。ファイルを保持してプロフィールを削除できます。|Менеджер не может удалить эту папку. Можно убрать профиль, сохранив файлы.
deleteFilesFailed|No se pudieron borrar todos los archivos. El perfil sigue disponible para revisar la carpeta y volver a intentarlo.|Some files could not be deleted. The profile remains available so you can inspect the folder and retry.|Não foi possível apagar todos os arquivos. O perfil permanece disponível para verificar a pasta e tentar novamente.|部分文件未能删除，配置将保留以便检查文件夹并重试。|一部のファイルを削除できませんでした。フォルダーを確認し再試行できるようプロフィールを保持します。|Не все файлы удалось удалить. Профиль сохранён для проверки папки и повторной попытки.
`;
for (const line of deletionWords.trim().split("\n")) {
  const [key, ...values] = line.split("|");
  for (let i = 0; i < languages.length; i++)
    window.I18N[languages[i]][key] = values[i] || values[1] || key;
}
const gameOptionsWords = `
chooseWorld|Seleccionar mapa|Select a map|Selecionar mapa|选择地图|マップを選択|Выбрать карту
randomWorld|Mundo aleatorio|Random world|Mundo aleatório|随机世界|ランダムワールド|Случайный мир
worldChoicesHelp|Elige un mapa detectado, escribe el nombre de un mapa personalizado o usa RWG para generar uno.|Choose a detected map, type a custom map name, or use RWG to generate a world.|Escolha um mapa detectado, digite um nome personalizado ou use RWG para gerar um mundo.|选择已检测到的地图，输入自定义地图名称，或使用 RWG 生成世界。|検出されたマップを選ぶか、カスタムマップ名を入力するか、RWGで生成します。|Выберите найденную карту, введите имя своей карты или используйте RWG для генерации.
managedOption|El gestor fija este valor para este servidor.|The manager sets this value for this server.|O gerenciador define este valor para este servidor.|管理器为此服务器设置此值。|マネージャーがこのサーバーの値を設定します。|Менеджер задаёт это значение для сервера.
sandboxEditorHelp|Estos controles generan el código Sandbox de esta versión. Guarda los cambios y vuelve a iniciar el servidor para aplicarlos.|These controls generate the Sandbox code for this version. Save changes and start the server again to apply them.|Estes controles geram o código Sandbox desta versão. Salve e inicie o servidor novamente para aplicar.|这些控件生成此版本的沙盒代码。保存后重新启动服务器以应用。|このバージョンのサンドボックスコードを生成します。保存後にサーバーを起動して適用します。|Эти настройки формируют код песочницы для этой версии. Сохраните изменения и снова запустите сервер.
difficultyPreset|Preajuste de dificultad|Difficulty preset|Predefinição de dificuldade|难度预设|難易度プリセット|Предустановка сложности
chooseDifficulty|Elige un preajuste|Choose a preset|Escolha uma predefinição|选择预设|プリセットを選択|Выберите предустановку
difficultyHelp|Elegir un preajuste sustituye los ajustes Sandbox del formulario.|Choosing a preset replaces the Sandbox settings in this form.|Escolher uma predefinição substitui os ajustes Sandbox do formulário.|选择预设将替换此表单中的沙盒设置。|プリセットを選ぶとフォームのサンドボックス設定が置き換わります。|Выбор предустановки заменит настройки песочницы в форме.
walkSpeed|Caminar|Walk|Andar|步行|歩く|Шаг
jogSpeed|Trotar|Jog|Trocar|慢跑|ジョギング|Трусца
runSpeed|Correr|Run|Correr|跑步|走る|Бег
sprintSpeed|Esprintar|Sprint|Disparar|冲刺|全力疾走|Спринт
nightmareSpeed|Pesadilla|Nightmare|Pesadelo|噩梦|悪夢|Кошмар
Scavenger|Carroñero|Scavenger|Catador|拾荒者|スカベンジャー|Мусорщик
Adventurer|Aventurero|Adventurer|Aventureiro|冒险家|冒険者|Искатель приключений
Nomad|Nómada|Nomad|Nômade|游牧者|ノーマッド|Кочевник
Warrior|Guerrero|Warrior|Guerreiro|战士|戦士|Воин
True Survivalist|Superviviente|True Survivalist|Sobrevivente|真正的幸存者|真のサバイバー|Выживальщик
Insane|Demente|Insane|Insano|疯狂|狂気|Безумие
sandboxPlayer|Jugador|Player|Jogador|玩家|プレイヤー|Игрок
sandboxEntities|Zombis y criaturas|Entities|Zumbis e criaturas|僵尸和生物|ゾンビと生物|Зомби и существа
sandboxWorld|Mundo|World|Mundo|世界|ワールド|Мир
sandboxResources|Recursos|Resources|Recursos|资源|資源|Ресурсы
sandboxCrafting|Fabricación|Crafting|Fabricação|制作|クラフト|Крафт
sandboxTraders|Comerciantes|Traders|Comerciantes|商人|トレーダー|Торговцы
sandboxTasks|Misiones|Tasks|Missões|任务|クエスト|Задания
sandboxMisc|Otros|Misc|Outros|其他|その他|Прочее
`;
for (const line of gameOptionsWords.trim().split("\n")) {
  const [key, ...values] = line.split("|");
  for (let i = 0; i < languages.length; i++)
    window.I18N[languages[i]][key] = values[i];
}
