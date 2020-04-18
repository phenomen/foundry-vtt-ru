Hooks.once('init', () => {

    if (typeof Babele !== 'undefined') {

        Babele.get().register({
            module: 'ru-RU',
            lang: 'ru',
            dir: 'compendium'
        });

    }
});