/**
 * Custom Handlebars for KNIGHT
 */
export const RegisterHandlebars = function () {
    Handlebars.registerHelper('importCreator', function (part) {
        return `systems/cthulhu-no-kami/templates/creator/${part}.html`;
    });

    Handlebars.registerHelper('importParts', function (part) {
        return `systems/cthulhu-no-kami/templates/parts/${part}.html`;
    });

    Handlebars.registerHelper('importSubparts', function (subpart) {
        return `systems/cthulhu-no-kami/templates/parts/subparts/${subpart}.html`;
    });

    Handlebars.registerHelper('capitalize', function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);;
    });

    Handlebars.registerHelper('getCombatState', function (state, toGet) {
        return CONFIG.CNK.CombatState[state][toGet];
    });

    Handlebars.registerHelper('labelize', function (string) {
        const merge = Object.assign({}, CONFIG.CNK.ModPossible, CONFIG.CNK.ModJetPossible, CONFIG.CNK.UtilisationsPossibles);

        return game.i18n.localize(merge[string]);
    });

    Handlebars.registerHelper('labelizeType', function (string) {
        return game.i18n.localize(CONFIG.CNK.TypePossible[string]);
    });

    Handlebars.registerHelper('sanitize', function (string) {
        return string.replace(/<[^>]*>?/gm, '');
    });
};