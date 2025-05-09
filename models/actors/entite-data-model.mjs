import ActorsModels from "../parts/actors-models.mjs";

export class EntiteDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {EmbeddedDataField, SchemaField, StringField, NumberField, ArrayField, ObjectField, HTMLField} = foundry.data.fields;
        const itm = new ActorsModels('entite');
        let data = itm.integration();
        data.challenge = new NumberField({initial:1});
        data.niveau = new SchemaField({
            actuel:new NumberField({initial:1}),
            contact:new NumberField({initial:0}),
            distance:new NumberField({initial:0}),
            magique:new NumberField({initial:0}),
        });
        data.wpnequipped = new StringField({initial:""});
        data.listwpnequipped = new ArrayField(new StringField({initial:""}));

		return data;
	}

	_initialize(options = {}) {
		super._initialize(options);
	}

    get actor() {
        return this.parent;
    }

    get items() {
        return this.actor.items;
    }

    get profil() {
        return this.items.find(items => items.type === 'profil');
    }

    get traits() {
        return this.items.filter(items => items.type === 'trait');
    }

    get dataArmure() {
        const armure = this.items.filter(itm => itm.type === 'armure' && itm.system.equip);
        let totalArmure = 0;
        let totalReduction = 0;

        for (let a of armure) {
          totalArmure += parseInt(a.system.defense);
          totalReduction += parseInt(a.system.reduction);
        }

        return {
            armure:totalArmure,
            reduction:totalReduction,
        }
    }

    get dataVoie() {
        const profil = this.profil;
        const voies = profil?.system?.voie ?? {};
        let ptscapacites = 0;
        let bonusRoll = {
          force:[],
          dexterite:[],
          constitution:[],
          perception:[],
          intelligence:[],
          sagesse:[],
          charisme:[],
          contact:[],
          distance:[],
          magique:[],
          volonte:[],
        };
        let bonusRollCondition = {
          force:[],
          dexterite:[],
          constitution:[],
          perception:[],
          intelligence:[],
          sagesse:[],
          charisme:[],
          contact:[],
          distance:[],
          magique:[],
          volonte:[],
        };

        for(let v in voies) {
            const voie = voies[v];
            const listrang = voie.system.listrang;

            for(let r in listrang) {
                const rang = listrang[r];
                const isSelected = rang?.selected ?? false;
                const modjet = rang?.modjet?.list ?? {};
                let vRang = parseInt(r.replace('rang', ''));

                if(isSelected) {
                    switch(voie.system.type) {
                    case 'predilection':
                    case 'famille':
                    case 'horsprofil':
                        if(vRang <= 2) ptscapacites += 1;
                        else ptscapacites += 2;
                        break;

                    case 'horsfamille':
                    case 'prestige':
                        ptscapacites += 2;
                        break;
                    }

                    for(let j in modjet) {
                    const dJ = modjet[j];
                    const name = dJ.key;
                    const value = dJ.value;
                    const condition = dJ.condition;

                    if(name !== "") {
                        const listcar = CONFIG.CNK.ListCaracteristiques;

                        if(listcar.includes(name)) {
                        if(condition !== "") bonusRollCondition[name].push({
                            value:value,
                            name:condition
                        })
                        else {
                            bonusRoll[name].push({
                                name:rang.name === '' ? game.i18n.localize(`CNK.VOIE.${r.charAt(0).toUpperCase() + r.slice(1)}`) : rang.name,
                                value:value,
                                active:true
                            });
                        }
                        }
                    }
                    }
                }
            }
        }

        return {
            bonusRoll,
            bonusRollCondition,
            ptscapacites
        }
    }

    get dataTraits() {
        const traits = this.traits;
        let bonusRoll = {
          force:[],
          dexterite:[],
          constitution:[],
          perception:[],
          intelligence:[],
          sagesse:[],
          charisme:[],
          contact:[],
          distance:[],
          magique:[],
          volonte:[],
        };
        let bonusRollCondition = {
          force:[],
          dexterite:[],
          constitution:[],
          perception:[],
          intelligence:[],
          sagesse:[],
          charisme:[],
          contact:[],
          distance:[],
          magique:[],
          volonte:[],
        };

        for(let t in traits) {
            const data = traits[t];
            const modjet = data.system?.modjet?.list ?? {};

            for(let j in modjet) {
                const dJ = modjet[j];
                const name = dJ.key;
                const value = dJ.value;
                const condition = dJ.condition;

                if(name !== "") {
                const listroll = [].concat(CONFIG.CNK.ListCaracteristiques, CONFIG.CNK.ListCombatWithRoll, CONFIG.CNK.ListDerivesWithRoll);

                if(listroll.includes(name)) {
                    if(condition !== "") bonusRollCondition[name].push({
                    value:value,
                    condition:condition
                    })
                    else {
                    bonusRoll[name].push({
                        name:data.name,
                        value:value,
                        active:true
                    });
                    }
                }
                }
            }
        }

        return {
            bonusRoll,
            bonusRollCondition
        }
    }

    prepareBaseData() {
    }

    prepareDerivedData() {
        const profil = this.profil;
        const getArmure = this.dataArmure;
        const getVoie = this.dataVoie;

        this._setCarac();
        this._setNiveau(profil);
        this._setDerives();
        this._setCombat(profil, getArmure.armure, getArmure.reduction);
        this._setBonusRoll(getVoie);
    }

    static migrateData(source) {
        return super.migrateData(source);
    }

    _setCarac() {
        const carac = this.caracteristiques;

        for (let key in carac) {
          let total = 0;
          let bonusMod = 0;
          total += parseInt(carac[key].score ?? 0);
          total += parseInt(carac[key].divers ?? 0);
          total += parseInt(carac[key].temp ?? 0);
          total += parseInt(carac[key].other ?? 0);
          bonusMod += parseInt(carac[key].modOther ?? 0);

          Object.defineProperty(carac[key], 'total', {
              value: total,
          });

          Object.defineProperty(carac[key], 'modificateur', {
              value: Math.floor((total-10)/2)+bonusMod,
          });
        }
    }

    _setNiveau(profil) {
        const niveau = parseInt(this.niveau.actuel);

        if(niveau === 1) {
            Object.defineProperty(this.derives.pv, 'dv', {
                value: parseInt(profil?.system?.dv ?? 0),
            });

            Object.defineProperty(this.derives.pv, 'con', {
                value: parseInt(this.caracteristiques.constitution.modificateur),
            });
        }
    }

    _setDerives() {
        const derives = this.derives;

        for(let key in derives) {
            const notAutoCalc = ['folie', 'blessures', 'ki'];
            const d = derives[key];
            const config = CONFIG.CNK.Derives[key];

            Object.defineProperty(d, 'template', {
                value: config.templates,
                enumerable: true,
                configurable: true,
                writable: true,
            });

            Object.defineProperty(d.template, 'key', {
                value: key,
                enumerable: true,
                configurable: true,
                writable: true,
            });

            Object.defineProperty(d.template, 'label', {
                value: game.i18n.localize(CONFIG.CNK.Derives[key].label),
                enumerable: true,
                configurable: true,
                writable: true,
            });

            this._setBaseData(key);

          if(!notAutoCalc.includes(key)) {
            const calc = Math.max(parseInt(d.base)+parseInt(d.temp)+parseInt(d.mod), 0);

            if(config.templates.isDouble) {
                Object.defineProperty(d, 'max', {
                    value: calc,
                });

                if(d.value > calc && key !== 'volonte') {
                    Object.defineProperty(d, 'value', {
                        value: calc,
                    });
                }
            } else if(key !== 'volonte') {
                Object.defineProperty(d, 'value', {
                    value: calc,
                });
            }
            else {
                Object.defineProperty(d, 'actuel', {
                    value: calc,
                });
            }
          }
        }
    }

    _setCombat(profil, armure, reduction) {
        const combat = this.combat;
        const carac = this.caracteristiques;

        for(let key in combat) {
            const c = combat[key];
            let total = 0;
            let totalContact = 0;
            let divers = c?.other ?? 0;

            switch(key) {
                case 'initiative':
                    c.car = parseInt(carac[c.carac].modificateur);
                    c.armure = 0-parseInt(armure);

                    total += parseInt(c.car);
                    total += parseInt(c.armure);
                break;

                case 'contact':
                    c.profil = profil ? profil.system.attaque.contact : 0;
                    c.car = parseInt(carac[c.carac].modificateur);
                    c.niveau = parseInt(this.niveau.contact);

                    total += parseInt(c.profil);
                    total += parseInt(c.car);
                    total += parseInt(c.niveau);
                break;

                case 'distance':
                    c.profil = profil ? profil.system.attaque.distance : 0;
                    c.car = parseInt(carac[c.carac].modificateur);
                    c.niveau = parseInt(this.niveau.distance);

                    total += parseInt(c.profil);
                    total += parseInt(c.car);
                    total += parseInt(c.niveau);
                break;

                case 'magique':
                    c.car = parseInt(carac[c.carac].modificateur);
                    c.niveau = parseInt(this.niveau.distance);

                    total += parseInt(c.car);
                    total += parseInt(c.niveau);
                break;

                case 'defense':
                    let actDef = 0;
                    if(c.type === 'simple') actDef += 2;
                    else if(c.type === 'totale') actDef += 4;

                    c.car = parseInt(carac[c.carac].modificateur);
                    c.armure = parseInt(armure);
                    c.actionDef = parseInt(actDef);

                    total += 10;
                    total += parseInt(c.car);
                    total += parseInt(c.armure);
                    totalContact += parseInt(c.actionDef);
                break;

                case 'reduction':
                    c.armure = parseInt(reduction);

                    total += parseInt(c.armure);
                break;
            }

            Object.defineProperty(c, 'divers', {
                value: divers,
            });

            if(key !== 'reduction') {
              Object.defineProperty(c, 'etat', {
                  value: c?.etat ?? 0,
              });

              total += parseInt(c.etat);
            }

            total += parseInt(c.divers);
            total += parseInt(c.mod);
            total += parseInt(c.temp);

            Object.defineProperty(c, 'total', {
                value: total,
            });

            if(key === 'defense') {
                Object.defineProperty(c, 'totalContact', {
                    value: total+totalContact,
                });
            }
        }
    }

    _setBonusRoll(voie) {
        const dataVoie = voie;
        const dataTraits = this.dataTraits;
        const carac = this.caracteristiques;
        const combat = this.combat;
        const derives = this.derives;

        for(let key in carac) {
            Object.defineProperty(carac[key], 'bonusRoll', {
                value: [].concat(dataVoie?.bonusRoll?.[key] ?? [], dataTraits?.bonusRoll?.[key] ?? []),
            });

            Object.defineProperty(carac[key], 'bonusRollCondition', {
                value: [].concat(dataVoie?.bonusRollCondition?.[key] ?? [], dataTraits?.bonusRollCondition?.[key] ?? []),
            });
        }

        for(let key in combat) {
            Object.defineProperty(combat[key], 'bonusRoll', {
                value: [].concat(dataVoie?.bonusRollCondition?.[key] ?? [], dataTraits?.bonusRollCondition?.[key] ?? []),
            });

            Object.defineProperty(combat[key], 'bonusRollCondition', {
                value: [].concat(dataVoie?.bonusRollCondition?.[key] ?? [], dataTraits?.bonusRollCondition?.[key] ?? []),
            });
        }

        for(let key in derives) {
            Object.defineProperty(derives[key], 'bonusRoll', {
                value: [].concat(dataVoie?.bonusRoll?.[key] ?? [], dataTraits?.bonusRoll?.[key] ?? []),
            });

            Object.defineProperty(derives[key], 'bonusRollCondition', {
                value: [].concat(dataVoie?.bonusRollCondition?.[key] ?? [], dataTraits?.bonusRollCondition?.[key] ?? []),
            });
        }
    }

    _setWpn() {
        const listWpn = ['wpncontact', 'wpndistance', 'wpnartillerie', 'wpngrenade'];
        const wpn = this.items.filter(items => listWpn.includes(items.type));
        let wpnequipped = "";
        let listWpnEquipped = [];

        for(let w of wpn) {
          const equipped = w.system?.equipped ?? "";

          if(equipped !== '') listWpnEquipped.push(w._id);

          if(equipped === '1main' && wpnequipped === '') wpnequipped = '1main';
          else if((equipped === '2mains' && wpnequipped === '') || (equipped === '1main' && wpnequipped === '1main')) wpnequipped = '2mains';
        }

        Object.defineProperty(this, 'wpnequipped', {
            value: wpnequipped,
        });

        Object.defineProperty(this, 'listwpnequipped', {
            value: listWpnEquipped,
        });
    }

    _setBaseData(key) {
        const p = this.profil;
        const n = parseInt(this.niveau.actuel);
        const c = this.caracteristiques;
        const d = this.derives;
        let pSerenite = 0;
        let pChance = 0;
        let total = parseInt(d[key]?.other ?? 0);

        if(p) {
            pSerenite = parseInt(p.system.serenite);
            pChance = parseInt(p.system.chance);
        }

        switch(key) {
            case 'pv':
            total += parseInt(d.pv.dv)+parseInt(d.pv.con);
            break;

            case 'volonte':
            total += Math.floor((parseInt(c.perception.modificateur)+parseInt(c.intelligence.modificateur))/2);
            break;

            case 'serenite':
            total += pSerenite+parseInt(c.intelligence.modificateur)+parseInt(c.perception.modificateur)-parseInt(this?.mythos ?? 0);
            break;

            case 'chance':
            total += pChance+parseInt(c.charisme.modificateur);
            break;

            case 'maho':
            total += n+parseInt(d.ki.actuel)+parseInt(c.constitution.modificateur);
            break;
        }

        Object.defineProperty(this.derives[key], 'base', {
            value: total,
        });
    };
}
