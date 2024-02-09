export const CNK = {};

CNK.ListCaracteristiques = ['force', 'dexterite', 'constitution', 'perception', 'intelligence', 'sagesse', 'charisme'];
CNK.ListCombatWithRoll = ['contact', 'distance', 'magique']
CNK.ListDerivesWithData = ['pv', 'maho', 'serenite', 'volonte', 'chance'];
CNK.ListWpnCanBeEquipped = ['wpncontact', 'wpndistance', 'wpngrenade'];
CNK.ListDerivesWithRoll = ['volonte'];

CNK.Famille = {
    'action':{
        attaque:{
            total:2,
            contact:0,
            distance:0,
        },
        dv:'10',
        serenite:0,
        chance:0,
        capacite:0,
    },
    'reflexion':{
        attaque:{
            total:0,
            contact:0,
            distance:0,
        },
        dv:'6',
        serenite:2,
        chance:0,
        capacite:2,
    },
    'societe':{
        attaque:{
            total:1,
            contact:0,
            distance:0,
        },
        dv:'8',
        serenite:0,
        chance:0,
        capacite:2,
    }
};

CNK.Derives = {
    'pv':{
        label:'CNK.DERIVES.Point-de-vie-short',
        templates:{
            class:'red double',
            isDouble:true,
            hasMin:true,
        }
    },
    'maho':{
        label:'CNK.DERIVES.Maho',
        templates:{
            class:'red double',
            isDouble:true,
            hasMin:true,
        }
    },
    'folie':{
        label:'CNK.DERIVES.Folie',
        templates:{
            class:'blue simple',
        }
    },
    'serenite':{
        label:'CNK.DERIVES.Serenite',
        templates:{
            class:'blue double',
            isDouble:true,
            hasMin:true,
        }
    },
    'volonte':{
        label:'CNK.DERIVES.Volonte',
        templates:{
            class:'yellow lock',
            isLock:true,
        }
    },
    'chance':{
        label:'CNK.DERIVES.Chance',
        templates:{
            class:'yellow double',
            isDouble:true,
            hasMin:true,
        }
    },
    'blessures':{
        label:'CNK.DERIVES.Blessures-graves',
        templates:{
            label:'CNK.DERIVES.Blessures-graves',
            class:'red simple doubleBlock1',
            isDoubleBlock:true,
            hasMin:true,
        }
    },
    'ki':{
        label:'CNK.DERIVES.Ki',
        templates:{
            label:'CNK.DERIVES.Ki',
            class:'green simple doubleBlock2',
        }
    },
};

CNK.CarPossible = {
    'force':'CNK.CARACTERISTIQUES.Force',
    'dexterite':'CNK.CARACTERISTIQUES.Dexterite',
    'constitution':'CNK.CARACTERISTIQUES.Constitution',
    'intelligence':'CNK.CARACTERISTIQUES.Intelligence',
    'perception':'CNK.CARACTERISTIQUES.Perception',
    'charisme':'CNK.CARACTERISTIQUES.Charisme',
};

CNK.ModPossible = {
    'system.derives.pv.other':'CNK.DERIVES.Points-de-vie',
    'system.derives.maho.other':'CNK.DERIVES.Maho',
    'system.derives.serenite.other':'CNK.DERIVES.Serenite',
    'system.derives.volonte.other':'CNK.DERIVES.Volonte',
    'system.derives.chance.other':'CNK.DERIVES.Chance',
    'system.caracteristiques.force.other':'CNK.CARACTERISTIQUES.Force',
    'system.caracteristiques.dexterite.other':'CNK.CARACTERISTIQUES.Dexterite',
    'system.caracteristiques.constitution.other':'CNK.CARACTERISTIQUES.Constitution',
    'system.caracteristiques.intelligence.other':'CNK.CARACTERISTIQUES.Intelligence',
    'system.caracteristiques.perception.other':'CNK.CARACTERISTIQUES.Perception',
    'system.caracteristiques.charisme.other':'CNK.CARACTERISTIQUES.Charisme',
    'system.caracteristiques.force.modOther':'CNK.CARACTERISTIQUES.ModForce',
    'system.caracteristiques.dexterite.modOther':'CNK.CARACTERISTIQUES.ModDexterite',
    'system.caracteristiques.constitution.modOther':'CNK.CARACTERISTIQUES.ModConstitution',
    'system.caracteristiques.intelligence.modOther':'CNK.CARACTERISTIQUES.ModIntelligence',
    'system.caracteristiques.perception.modOther':'CNK.CARACTERISTIQUES.ModPerception',
    'system.caracteristiques.charisme.modOther':'CNK.CARACTERISTIQUES.ModCharisme',
    'system.combat.initiative.other':'CNK.COMBAT.Initiative',
    'system.combat.contact.other':'CNK.COMBAT.Contact',
    'system.combat.distance.other':'CNK.COMBAT.Distance',
    'system.combat.magique.other':'CNK.COMBAT.Magique',
    'system.combat.defense.other':'CNK.COMBAT.Defense',
    'system.combat.reduction.other':'CNK.COMBAT.Reduction',
};

CNK.ModJetPossible = {
    'force':'CNK.CARACTERISTIQUES.Force',
    'dexterite':'CNK.CARACTERISTIQUES.Dexterite',
    'constitution':'CNK.CARACTERISTIQUES.Constitution',
    'intelligence':'CNK.CARACTERISTIQUES.Intelligence',
    'perception':'CNK.CARACTERISTIQUES.Perception',
    'charisme':'CNK.CARACTERISTIQUES.Charisme',
    'contact':'CNK.COMBAT.Contact',
    'distance':'CNK.COMBAT.Distance',
    'magique':'CNK.COMBAT.Magique',
    'volonte':"CNK.DERIVES.Resistance-mentale"
};

CNK.TypePossible = {
    'predilection':'CNK.VOIE.TYPE.Predilection',
    'famille':'CNK.VOIE.TYPE.Famille',
    'horsfamille':'CNK.VOIE.TYPE.HorsFamille',
    'horsprofil':'CNK.VOIE.TYPE.HorsProfil',
    'prestige':'CNK.VOIE.TYPE.Prestige',
};

CNK.UtilisationsPossibles = {
    "1main":'CNK.UTILISATIONS.1main',
    "2mains":'CNK.UTILISATIONS.2mains',
    "1mainou2mains":'CNK.UTILISATIONS.1mainou2mains',
}

CNK.DefensePossible = {
    'std':"CNK.COMBAT.DefenseSTD",
    'simple':"CNK.COMBAT.DefenseSimple",
    'totale':"CNK.COMBAT.DefenseTotale",
}