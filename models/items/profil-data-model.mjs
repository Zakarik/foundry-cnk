import ItemsModels from "../parts/items-models.mjs";

export class ProfilDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {EmbeddedDataField, SchemaField, StringField, NumberField, BooleanField, ObjectField, HTMLField} = foundry.data.fields;
        const itm = new ItemsModels('profil');
        let data = itm.integration();
        data.famille = new StringField({initial:""});
        data.dv = new StringField({initial:""});
        data.serenite = new NumberField({initial:0});
        data.chance = new NumberField({initial:0});
        data.capacite = new NumberField({initial:0});
        data.attaque = new SchemaField({
          total:new NumberField({initial:2}),
          contact:new NumberField({initial:0}),
          distance:new NumberField({initial:0}),
        });
        data.voie = new ObjectField();

		return data;
	}

	_initialize(options = {}) {
		super._initialize(options);
	}

    get item() {
        return this.parent;
    }

    prepareBaseData() {
    }

    prepareDerivedData() {
        const system = this;
        const listvoie = system?.voie ?? {};

        for(let v in listvoie) {
            const voie = listvoie[v].system;
            const listrangs = voie?.listrang;
            const filter = Object.entries(listrangs).filter(itm => itm[1].selected);
            const maxFilter = filter.length !== 0 ? Math.max(...Object.keys(filter).map(key => parseInt(key))) : undefined;
            const maxRang = maxFilter !== undefined ? filter[maxFilter][0] : 0;

            for(let r in listrangs) {
                const rang = listrangs[r];
                const listmodjet = rang.modjet?.list ?? {};

                if(rang.selected) {
                    for(let m in listmodjet) {
                        const modjet = listmodjet[m];
                        const selonrang = modjet?.selonrang ?? false;

                        if(selonrang) {
                            if(this.item.isOwned) {
                                const rawvalue = modjet?.rawvalue ?? 0;

                                Object.defineProperty(modjet, 'value', {
                                    value: rawvalue*parseInt(maxRang.replace('rang', '')),
                                });
                            } else {
                                Object.defineProperty(modjet, 'value', {
                                    value: 0,
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}
