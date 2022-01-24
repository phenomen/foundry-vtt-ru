export function InitAOS() {

    Hooks.on("setup", () => {
        game.aos.config.durations = mergeObject(game.aos.config.durations, {
            instant: "Мгновенное",
            round: "Раунд",
            minute: "Минута",
            hour: "Час",
            day: "День",
            permanent: "Постоянное"

        })

        game.aos.config.traits = mergeObject(game.aos.config.traits, {
            aetheric : "Аэфирное",
            blast : "Взрывное",
            cleave : "Рассекающее",
            close : "Ближнее",
            crushing : "Дробящее",
            defensive : "Защитное",
            ineffective : "Неэффективное",
            loud : "Громкое",
            magical : "Магическое",
            penetrating : "Бронебойное",
            piercing : "Колющее",
            range : "Дистанционное",
            reach : "Длинное",
            reload : "Перезаряжающееся",
            rend : "Ломающее",
            restraining : "Обездвиживающее",
            sigmarite : "Сигмаритное",
            slashing : "Рубящее",
            spread : "Кучное",
            subtle : "Незаметное",
            thrown : "Метательное",
            twohanded : "Двуручное"
        })

    })
}