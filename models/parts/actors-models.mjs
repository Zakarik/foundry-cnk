export default class ActorsModels {
    static SchemaField = foundry.data.fields.SchemaField;
    static BooleanField = foundry.data.fields.BooleanField;
    static NumberField = foundry.data.fields.NumberField;
    static HtmlField = foundry.data.fields.HTMLField;
    static StringField = foundry.data.fields.StringField;
    static ObjectField = foundry.data.fields.ObjectField;
    static ArrayField = foundry.data.fields.ArrayField;

    constructor(type) {
        this._type = type;
    }

    get type() {
        return this._type;
    }

    integration() {
        let data = {};
        if(this.type !== 'vehicule') data.caracteristiques = new ActorsModels.SchemaField(this._caracteristiques());
        if(this.type !== 'vehicule') data.derives = new ActorsModels.SchemaField(this._derives());
        if(this.type !== 'vehicule') data.combat = new ActorsModels.SchemaField(this._combat());
        data.description = new ActorsModels.HtmlField({initial:""});
        data.edit = new ActorsModels.BooleanField({initial:false});

        return data;
    }

    _caracteristiques() {
        const data = CONFIG.CNK.ListCaracteristiques;
        let result = {};

        for(let c of data) {
            let temp = foundry.utils.mergeObject(
                this._addNumberValue10(['score', 'total']),
                this._addNumberValue0(['modificateur', 'divers', 'temp', 'other', 'modOther']),
                this._addBonusRoll(),
            );

            result[c] = new ActorsModels.SchemaField(temp);
        }

        return result;
    }

    _derives() {
        const list = CONFIG.CNK.Derives;
        const listEntite = CONFIG.CNK.ListDerivesEntite;
        let result = {};

        for(let d in list) {
            if(this.type === 'entite' && !listEntite.includes(d)) continue;

            const isDouble = list[d]?.templates?.isDouble ?? false;

            let temp = foundry.utils.mergeObject(
                this._addNumberValue0(['actuel', 'base', 'mod', 'temp']),
                this._addBonusRoll(),
            );

            temp.template = new ActorsModels.ObjectField();

            if(isDouble) {
                temp = foundry.utils.mergeObject(
                    temp,
                    this._addNumberValue0(['max', 'value']),
                );
            }

            if(d === 'pv') {
                temp = foundry.utils.mergeObject(
                    temp,
                    this._addNumberValue0(['dv', 'con']),
                );
            }

            result[d] = new ActorsModels.SchemaField(temp);
        }

        return result;
    }

    _combat() {
        let result = {};

        result.contact = new ActorsModels.SchemaField(foundry.utils.mergeObject(
            {
                carac:new ActorsModels.StringField({initial:'dexterite'}),
            },
            foundry.utils.mergeObject(
                this._addBonusRoll(),
                this._addNumberValue0(['car', 'divers', 'etat', 'mod', 'niveau', 'profil', 'temp', 'total'])
            )
        ));

        result.distance = new ActorsModels.SchemaField(foundry.utils.mergeObject(
            {
                carac:new ActorsModels.StringField({initial:'dexterite'}),
            },
            foundry.utils.mergeObject(
                this._addBonusRoll(),
                this._addNumberValue0(['car', 'divers', 'etat', 'mod', 'niveau', 'profil', 'temp', 'total']),
            )
        ));

        result.magique = new ActorsModels.SchemaField(foundry.utils.mergeObject(
            {
                carac:new ActorsModels.StringField({initial:'dexterite'}),
            },
            foundry.utils.mergeObject(
                this._addBonusRoll(),
                this._addNumberValue0(['car', 'divers', 'etat', 'mod', 'niveau', 'profil', 'temp', 'total']),
            )
        ));

        result.defense = new ActorsModels.SchemaField(foundry.utils.mergeObject(
            foundry.utils.mergeObject(
                {
                    carac:new ActorsModels.StringField({initial:'dexterite'}),
                },
                this._addBonusRoll(),
            ),
            foundry.utils.mergeObject(
                this._addNumberValue0(['actionDef', 'armure', 'car', 'divers', 'etat', 'mod', 'temp']),
                this._addNumberValue10(['total', 'totalContact'])
            )
        ));

        result.initiative = new ActorsModels.SchemaField(foundry.utils.mergeObject(
            {
                carac:new ActorsModels.StringField({initial:'dexterite'}),
            },
            foundry.utils.mergeObject(
                this._addBonusRoll(),
                this._addNumberValue0(['armure', 'car', 'divers', 'etat', 'mod', 'temp', 'total'])
            )
        ));

        result.reduction = new ActorsModels.SchemaField(foundry.utils.mergeObject(
            this._addBonusRoll(),
            this._addNumberValue0(['armure', 'divers', 'mod', 'temp', 'total']),
        ));

        return result;
    }

    _addNumberValue0(list=[]) {
        let data = {};

        for(let l of list) {
            data[l] = new ActorsModels.NumberField({initial:0});
        }

        return data;
    }

    _addNumberValue10(list=[]) {
        let data = {};

        for(let l of list) {
            data[l] = new ActorsModels.NumberField({initial:10});
        }

        return data;
    }

    _addBonusRoll() {
        return {
            bonusRoll:new ActorsModels.ArrayField(new ActorsModels.ObjectField()),
            bonusRollCondition:new ActorsModels.ArrayField(new ActorsModels.ObjectField()),
        }
    }
}