import ActorsModels from "../parts/actors-models.mjs";

export class VehiculeDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {EmbeddedDataField, SchemaField, StringField, NumberField, BooleanField, ObjectField, ArrayField} = foundry.data.fields;
        const itm = new ActorsModels('vehicule');
        let data = itm.integration();

        data.caracteristiques = new SchemaField({
            agilite:new SchemaField({
                score:new NumberField({initial:0}),
                temp:new NumberField({initial:0}),
                other:new NumberField({initial:0}),
                base:new NumberField({initial:0}),
                total:new NumberField({initial:0}),
            }),
            force:new SchemaField({
                score:new NumberField({initial:0}),
                temp:new NumberField({initial:0}),
                other:new NumberField({initial:0}),
                base:new NumberField({initial:0}),
                total:new NumberField({initial:0}),
            }),
        });

        data.combat = new SchemaField({
            base:new NumberField({initial:0}),
            score:new NumberField({initial:0}),
            temp:new NumberField({initial:0}),
            other:new NumberField({initial:0}),
            total:new NumberField({initial:0}),
        })

        data.derives = new SchemaField({
            places:new SchemaField({
                actuel:new NumberField({initial:4}),
                max:new NumberField({initial:4}),
                temp:new NumberField({initial:0}),
                base:new NumberField({initial:4}),
            }),
            pv:new SchemaField({
                actuel:new NumberField({initial:0}),
                max:new NumberField({initial:0}),
                temp:new NumberField({initial:0}),
                base:new NumberField({initial:0}),
            }),
        });

        data.listpassagers = new ArrayField(new StringField({initial:""}));
        data.listpilote = new ArrayField(new StringField({initial:""}));
        data.listequipage = new ObjectField();
        data.passagers = new ObjectField();
        data.pilote = new ObjectField();
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

    prepareBaseData() {
    }

    prepareDerivedData() {
        this._setPassagersPilote();
        this._setCarac();
        this._setDerives();
        this._setCombat();
    }

    static migrateData(source) {
        return super.migrateData(source);
    }

    _setPassagersPilote() {
        const passagers = this.listpassagers;
        const pilote = this.listpilote;
        let fPassagers = {};
        let fPilote = {};

        for(let i = 0;i < passagers.length;i++) {
          const actor = game.actors.get(passagers[i]);

          if(actor === undefined) passagers[i] = game.i18n.localize('CNK.VEHICULE.Inexistant');
          else {
            fPassagers[actor._id] = actor.name;
          }
        }

        for(let i = 0;i < pilote.length;i++) {
          const actor = game.actors.get(pilote[i]);

          if(actor === undefined) pilote[i] = game.i18n.localize('CNK.VEHICULE.Inexistant');
          else {
            fPilote[actor._id] = actor.name;
          }
        }

        Object.defineProperty(this, 'passagers', {
            value: fPassagers,
        });

        Object.defineProperty(this, 'pilote', {
            value: fPilote,
        });
    }

    _setCarac() {
        const carac = this.caracteristiques;

        for (let key in carac) {
          let total = 0;
          total += parseInt(carac[key].score ?? 0);
          total += parseInt(carac[key].temp ?? 0);
          total += parseInt(carac[key].other ?? 0);

          Object.defineProperty(carac[key], 'total', {
              value: total,
          });
        }
    }

    _setDerives() {
        const derives = this.derives;

        for(let key in derives) {
            const d = derives[key];
            let total = 0;
            let used = 0;

            if(key === 'places') {
                d.base = parseInt(carac.force.total)+4;
                used = parseInt(passagers.length+pilote.length);
            }

            total += parseInt(d.base ?? 0);
            total += parseInt(d.temp ?? 0);

            Object.defineProperty(d, 'max', {
                value: total,
            });

            if(key === 'places') {
                Object.defineProperty(d, 'actuel', {
                    value: total-used,
                });
            }
        }
    }

    _setCombat() {
        const combat = this.combat;

        for(let key in combat) {
            let total = 0;

            total += parseInt(combat[key].base ?? 0);
            total += parseInt(combat[key].score ?? 0);
            total += parseInt(combat[key].temp ?? 0);
            total += parseInt(combat[key].other ?? 0);

            Object.defineProperty(combat[key], 'total', {
                value: total,
            });
        }
    }

    _setWpn() {
        const listWpn = ['wpncontact', 'wpndistance', 'wpnartillerie', 'wpngrenade'];
        const wpn = this.items.filter(items => listWpn.includes(items.type));
        let wpnequipped = "";
        let listWpnEquipped = [];

        for(let w of wpn) {
            listWpnEquipped.push(w._id);

            wpnequipped = '1main';
            wpnequipped = '2mains';
        }

        Object.defineProperty(this, 'wpnequipped', {
            value: wpnequipped,
        });

        Object.defineProperty(this, 'listwpnequipped', {
            value: listWpnEquipped,
        });
    }
}
