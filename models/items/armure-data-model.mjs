import ItemsModels from "../parts/items-models.mjs";

export class ArmureDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {NumberField, BooleanField} = foundry.data.fields;
        const itm = new ItemsModels('armure');
        let data = itm.integration();
        data.defense = new NumberField({initial:0});
        data.reduction = new NumberField({initial:0});
        data.equip = new BooleanField({initial:false});

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
