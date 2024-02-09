export const RegisterSettings = function () {
    /* ------------------------------------ */
    /* User settings                        */
    /* ------------------------------------ */
    game.settings.register("cthulhu-no-kami", "methode-creation", {
        name: "CNK.SETTINGS.CREATION.Label",
        hint: "CNK.SETTINGS.CREATION.Hint",
        scope: "world",
        config: true,
        type: String,
        default: "Defaut",
        choices:{
            "Defaut":"CNK.SETTINGS.CREATION.Defaut",
            "Aleatoire":"CNK.SETTINGS.CREATION.Aleatoire",
            "AleatoirePonderee":"CNK.SETTINGS.CREATION.AleatoirePonderee",
            "Repartition":"CNK.SETTINGS.CREATION.Repartition",
        }
    });
};
