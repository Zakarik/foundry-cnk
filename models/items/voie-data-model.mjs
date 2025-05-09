import ItemsModels from "../parts/items-models.mjs";

export class VoieDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {EmbeddedDataField, SchemaField, StringField, NumberField, BooleanField, ObjectField, HTMLField} = foundry.data.fields;
        const itm = new ItemsModels('voie');
        let data = itm.integration();
        data.listrang = new SchemaField({
            rang1: new ObjectField(),
            rang2: new ObjectField(),
            rang3: new ObjectField(),
            rang4: new ObjectField(),
            rang5: new ObjectField(),
        });

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
        const listrangs = system.listrang;

        for(let r in listrangs) {
            const rang = listrangs[r];
            const listmodjet = rang.modjet?.list ?? {};

            for(let m in listmodjet) {
                const modjet = listmodjet[m];
                const selonrang = modjet?.selonrang ?? false;

                if(selonrang) {
                    Object.defineProperty(modjet, 'value', {
                        value: 0,
                    });
                }
            }
        }
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}
