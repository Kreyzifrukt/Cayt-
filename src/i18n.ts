import type { Language } from "./types/player";

const TEXT = {
  en: {
    dashboard:"Dashboard", statistics:"Statistics", settings:"Settings", yourSpace:"YOUR SPACE", arcade:"THE ARCADE",
    playerLevel:"PLAYER LEVEL", xpToNext:"XP TO NEXT LEVEL", back:"← BACK TO ARCADE", fullscreen:"FULLSCREEN",
    personalBest:"PERSONAL BEST", howToPlay:"HOW TO PLAY", gameGoal:"GOAL", rules:"RULES", controls:"CONTROLS",
    profileConfiguration:"PLAYER CONFIGURATION", settingsTitle:"YOUR SETTINGS.", settingsSubtitle:"Profile, appearance, language and save management.",
    playerName:"PLAYER NAME", appearance:"APPEARANCE", appearanceHelp:"Choose the arcade color scheme.",
    neonDark:"NEON DARK", light:"LIGHT", sound:"SOUND", soundHelp:"Sound preference for supported game effects.",
    soundOn:"SOUND ON", soundOff:"SOUND OFF", language:"LANGUAGE", languageHelp:"Choose the interface language.",
    english:"ENGLISH", ukrainian:"УКРАЇНСЬКА", cosmeticShop:"COSMETIC SHOP", shopHelp:"Unlock an accent palette with arcade coins and equip it instantly.",
    equipped:"EQUIPPED", unlocked:"UNLOCKED", localBackup:"LOCAL BACKUP", backupHelp:"Export or restore your profile, XP, records and favorites.",
    export:"EXPORT", import:"IMPORT", resetProfile:"RESET PROFILE", resetHelp:"Permanently clear local progress on this device.",
    resetAll:"RESET ALL DATA", privacy:"Progress is stored in this browser. Export a backup in Settings before clearing site data.",
    noBackend:"No account or backend is connected. Cloud sync and online leaderboards require a server and authentication layer.",
    keyboardHint:"Keyboard controls are shown in each game where supported. Your score and XP are saved automatically.",
    online:"SYSTEM ONLINE", yourRecord:"YOUR RECORD.", playerPerformance:"PLAYER PERFORMANCE",
    totalRuns:"TOTAL RUNS", victories:"VICTORIES", totalXp:"TOTAL XP", personalBests:"PERSONAL BESTS",
    achievements:"ACHIEVEMENTS", unlockedCount:"UNLOCKED", unlockedStatus:"UNLOCKED", locked:"LOCKED",
    welcome:"WELCOME BACK", ready:"◷ YOUR ARCADE IS READY", nextBest:"Your next personal best is one game away.",
    featured:"FEATURED GAME", enterGrid:"ENTER THE", neonGrid:"NEON GRID.", heroText:"Fast moves. Clean lines. A high score waiting to happen.",
    playSnake:"PLAY SNAKE", gamesPlayed:"GAMES PLAYED", bestScore:"BEST SCORE", dailyQuest:"DAILY QUEST",
    warmup:"ARCADE WARM-UP", dailyDescription:"Finish 3 games today to earn 50 bonus XP and 25 coins.",
    rewardClaimed:"REWARD CLAIMED", dailyReward:"DAILY REWARD · 50 XP + 25 COINS",
    pickChallenge:"PICK YOUR CHALLENGE", showAll:"SHOW ALL GAMES", favorites:"FAVORITES",
    searchGames:"Search games...", allGenres:"ALL GENRES", noGames:"NO MATCHING GAMES",
    trySearch:"Try another search or clear the filters.", best:"BEST", play:"PLAY",
    progressYours:"YOUR PROGRESS STAYS YOURS.", progressHelp:"Scores, XP and favorites are saved locally. Export a backup in Settings.",
    localFirst:"LOCAL-FIRST", score:"SCORE", coins:"COINS", firstSteps:"FIRST STEPS",
    resetConfirm:"Reset all local progress, records, favorites and profile settings? This cannot be undone.",
    invalidBackup:"Backup file is invalid or damaged."
  },
  uk: {
    dashboard:"Головна", statistics:"Статистика", settings:"Налаштування", yourSpace:"ВАШ ПРОСТІР", arcade:"АРКАДА",
    playerLevel:"РІВЕНЬ ГРАВЦЯ", xpToNext:"ДО НАСТУПНОГО РІВНЯ", back:"← НАЗАД ДО АРКАДИ", fullscreen:"НА ВЕСЬ ЕКРАН",
    personalBest:"ОСОБИСТИЙ РЕКОРД", howToPlay:"ЯК ГРАТИ", gameGoal:"МЕТА", rules:"ПРАВИЛА", controls:"КЕРУВАННЯ",
    profileConfiguration:"НАЛАШТУВАННЯ ГРАВЦЯ", settingsTitle:"ВАШІ НАЛАШТУВАННЯ.", settingsSubtitle:"Профіль, вигляд, мова та керування збереженнями.",
    playerName:"ІМ'Я ГРАВЦЯ", appearance:"ВИГЛЯД", appearanceHelp:"Оберіть кольорову тему аркади.",
    neonDark:"НЕОНОВА ТЕМНА", light:"СВІТЛА", sound:"ЗВУК", soundHelp:"Налаштування звукових ефектів у підтримуваних іграх.",
    soundOn:"ЗВУК УВІМКНЕНО", soundOff:"ЗВУК ВИМКНЕНО", language:"МОВА", languageHelp:"Оберіть мову інтерфейсу.",
    english:"ENGLISH", ukrainian:"УКРАЇНСЬКА", cosmeticShop:"МАГАЗИН ОФОРМЛЕННЯ", shopHelp:"Відкривайте кольорові теми за монети та одразу застосовуйте їх.",
    equipped:"ОБРАНО", unlocked:"ВІДКРИТО", localBackup:"ЛОКАЛЬНА КОПІЯ", backupHelp:"Експортуйте або відновлюйте профіль, досвід, рекорди та обране.",
    export:"ЕКСПОРТ", import:"ІМПОРТ", resetProfile:"СКИНУТИ ПРОФІЛЬ", resetHelp:"Назавжди очистити локальний прогрес на цьому пристрої.",
    resetAll:"СКИНУТИ ВСІ ДАНІ", privacy:"Прогрес зберігається в цьому браузері. Перед очищенням даних сайту експортуйте резервну копію.",
    noBackend:"Обліковий запис і сервер не підключені. Хмарна синхронізація та онлайн-таблиці рекордів потребують сервера й авторизації.",
    keyboardHint:"Керування клавіатурою показано в тих іграх, де воно підтримується. Рахунок і досвід зберігаються автоматично.",
    online:"СИСТЕМА ПРАЦЮЄ", yourRecord:"ВАШ РЕКОРД.", playerPerformance:"РЕЗУЛЬТАТИ ГРАВЦЯ",
    totalRuns:"УСЬОГО ІГОР", victories:"ПЕРЕМОГИ", totalXp:"УВЕСЬ ДОСВІД", personalBests:"ОСОБИСТІ РЕКОРДИ",
    achievements:"ДОСЯГНЕННЯ", unlockedCount:"ВІДКРИТО", unlockedStatus:"ВІДКРИТО", locked:"ЗАБЛОКОВАНО",
    welcome:"З ПОВЕРНЕННЯМ", ready:"◷ АРКАДА ГОТОВА", nextBest:"До нового особистого рекорду лише одна гра.",
    featured:"ГРА ТИЖНЯ", enterGrid:"УВІЙДІТЬ У", neonGrid:"НЕОНОВУ МЕРЕЖУ.", heroText:"Швидкі рухи. Чіткі лінії. Новий рекорд уже чекає.",
    playSnake:"ГРАТИ В ЗМІЙКУ", gamesPlayed:"ЗІГРАНО ІГОР", bestScore:"НАЙКРАЩИЙ РАХУНОК", dailyQuest:"ЩОДЕННЕ ЗАВДАННЯ",
    warmup:"АРКАДНА РОЗМИНКА", dailyDescription:"Зіграйте 3 гри сьогодні та отримайте 50 бонусного досвіду й 25 монет.",
    rewardClaimed:"НАГОРОДУ ОТРИМАНО", dailyReward:"ЩОДЕННА НАГОРОДА · 50 XP + 25 МОНЕТ",
    pickChallenge:"ОБЕРІТЬ ВИПРОБУВАННЯ", showAll:"ПОКАЗАТИ ВСІ ІГРИ", favorites:"ОБРАНЕ",
    searchGames:"Пошук ігор...", allGenres:"УСІ ЖАНРИ", noGames:"ІГОР НЕ ЗНАЙДЕНО",
    trySearch:"Спробуйте інший запит або скиньте фільтри.", best:"РЕКОРД", play:"ГРАТИ",
    progressYours:"ВАШ ПРОГРЕС НАЛЕЖИТЬ ВАМ.", progressHelp:"Рахунок, досвід і вибране зберігаються локально. Резервну копію можна створити в налаштуваннях.",
    localFirst:"ЛОКАЛЬНЕ ЗБЕРЕЖЕННЯ", score:"РАХУНОК", coins:"МОНЕТИ", firstSteps:"ПЕРШІ КРОКИ",
    resetConfirm:"Скинути весь локальний прогрес, рекорди, обране та налаштування профілю? Цю дію неможливо скасувати.",
    invalidBackup:"Файл резервної копії пошкоджений або має неправильний формат."
  }
} satisfies Record<Language, Record<string, string>>;

export function t(language: Language, key: keyof typeof TEXT.en): string {
  return TEXT[language][key] ?? TEXT.en[key];
}
