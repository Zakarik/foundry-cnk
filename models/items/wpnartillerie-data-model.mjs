import ItemsModels from "../parts/items-models.mjs";

export class WpnArtillerieDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {EmbeddedDataField, SchemaField, StringField, NumberField, BooleanField, ObjectField, HTMLField} = foundry.data.fields;
        const itm = new ItemsModels('wpndistance');
        let data = itm.integration();
        data.rechargement = new StringField({initial:""});
        data.portee = new NumberField({initial:0});
        data.aire = new NumberField({initial:0});
		return data;
	}

	_initialize(options = {}) {
		super._initialize(options);
	}

    get item() {
        return this.parent;
    }

    get actor() {
        return this.item.parent;
    }

    prepareBaseData() {
        Object.defineProperty(this, 'dm', {
            value: this.dm === "" ? "1D6" : this.dm,
        });
    }

    prepareDerivedData() {
        this._prepareWpnData();
    }

    static migrateData(source) {
        return super.migrateData(source);
    }

    _prepareWpnData() {
        const isOwned = this.item.isOwned;

        if(isOwned) {
            const actor = this.actor;
            let actData = actor.system;

            if(actor.type === 'vehicule') {
                const pilote = actData?.listpilote ?? [];

                if(pilote.length > 0) {
                    const getPilote = game.actors.get(pilote[0]);
                    actData = getPilote?.system ?? {};
                }
            }


            console.warn(actData)

            const actKi = actData?.derives?.ki?.actuel;
            const ki = parseInt(actKi);
            const data = this.wpn;
            const attaque = data.attaque;
            const degats = data.degats;
            let totalAtt = 0;
            let totalDgt = 0;
            let attKi = 0;
            let dgtKi = 0;

            if(attaque.kipositif && ki > 0) attKi += ki;
            if(attaque.kinegatif && ki < 0) attKi += ki;

            if(degats.kipositif && ki > 0) dgtKi += ki;
            if(degats.kinegatif && ki < 0) dgtKi += ki;

            totalAtt += attKi;
            totalAtt += attaque.base;

            totalDgt += dgtKi;
            totalDgt += degats.base;

            Object.defineProperty(this.wpn.attaque, 'ki', {
                value: attKi,
            });

            Object.defineProperty(this.wpn.attaque, 'total', {
                value: totalAtt,
            });

            Object.defineProperty(this.wpn.degats, 'ki', {
                value: dgtKi,
            });

            Object.defineProperty(this.wpn.degats, 'total', {
                value: totalDgt,
            });
        }
    }
}