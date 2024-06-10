# Русский перевод для Foundry VTT

![](https://img.shields.io/badge/версия_модуля-v12.327.2-blue)
![](https://img.shields.io/badge/требуется_FVTT-v11-orange)
![](https://img.shields.io/badge/поддерживается_FVTT-v12-green)

![](/public/images/module/cover.webp)

Модуль добавляет поддержку русского языка в Foundry VTT, а также многие системы и модули.

## Ссылки

- [Github](https://github.com/phenomen/foundry-vtt-ru)
- [manifest.json](https://github.com/phenomen/foundry-vtt-ru/releases/download/latest/module.json)
- [Модуль на сайте Foundry VTT](https://foundryvtt.com/packages/ru-ru/)
- [Русскоязычное сообщество Foundry в Discord](https://discord.gg/Z2CXFy35WF)

## Установка и настройка

**Нужно выполнить один раз:**

1. В главном меню на вкладке **Add-on Modules** нажмите **Install Module**
2. Введите в фильтр "русский перевод", в списке должен появится модуль _"Russian Translation | Русский перевод"_. Нажмите кнопку **Install**
3. Перейдите на вкладку **Configuration** и измените **Default Language** на "Russian - Russian Translation". Нажмите **Save Changes**.

**Нужно выполнять каждый раз для каждого мира:**

1. Находясь в игре перейдите на вкладку **Настройки игры** и нажмите **Управление модулями**.
2. Поставьте галочку напротив _"Russian Translation | Русский перевод"_ и нажмите **Сохранить настройки**.

**Примечание:** некоторые системы могут также требовать модули _Babele_ и _libWrapper_ для перевода содержимого библиотек.

## Информация о переводе

**Разработка и поддержка**: Phenomen

Модуль в данный момент имеет перевод самого приложения Foundry VTT, а также:

### Системы

- 13th Age
- AGE System
- Age of Sigmar: Soulbound
- Alien (Чужой)
- Blades in the Dark (Клинки во тьме)
- Call of Cthulhu (Зов Ктулху)
- City of Mist (Город Тумана)
- Coriolis (Кориолис)
- Cyberpunk RED
- Death in Space
- Delta Green
- Dungeon Crawl Classics
- Dungeon World (Мир Подземелий)
- Dungeons & Dragons 5
- Forbidden Lands (Запретные земли)
- Genesys / Star Wars FFG
- GUMSHOE (СЫШИК)
- Ironsworn / Starforged
- Mutants Year Zero (Мутанты. Точка Отсчёта)
- Old-School Essentials
- Pathfinder 1e
- Savage Worlds (Дневник Авантюриста)
- Shadow of the Demon Lord
- Star Trek Adventures (Звёздный Путь)
- Starfinder + Beginner Box
- Tales from the Loop (Тайны Эхосферы)
- The One Ring 2e
- The Witcher (Ведьмак)
- Traveler / Cepheus Engine
- Vaesen (Нечисть)
- Vampire V5 (Вампиры: Маскарад)
- Warhammer Fantasy Roleplay 4

### Модули

Переведено более 100 модулей, список в можно посмотреть `public/i18n/modules`

Оставляйте заявки на другие системы и модули в канале #перевод на нашем [Discord сервере](https://discord.gg/Z2CXFy35WF).

## Разработка

Проект использует [Bun](https://bun.sh/) для сборки.

### Установка

Устанавливает зависимости

```bash
bun install
```

### Сборка

Компилирует код и копирует статичные файлы в папку `ru-ru`

```bash
bun compile
```

### Релиз

Собирает модуль, минифицирует CSS и повышает версию

```bash
bun release
```
