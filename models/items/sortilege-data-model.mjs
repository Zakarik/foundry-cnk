import ItemsModels from "../parts/items-models.mjs";

export class SortilegeDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {StringField, NumberField} = foundry.data.fields;
        const itm = new ItemsModels('sortilege');
        let data = itm.integration();
        data.type = new StringField({initial:""});
        data.forme = new StringField({initial:""});
        data.rang = new NumberField({initial:1});
        data.caracteristique = new StringField({initial:"force"});
        data.attaque = new NumberField({initial:5});

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
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}
