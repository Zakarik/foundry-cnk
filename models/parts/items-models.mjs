export default class ItemsModels {
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
        data.description = new ItemsModels.HtmlField({initial:""});

        switch(this.type) {
            case 'avdv':
                data.cout = new ItemsModels.NumberField({initial:0});
                break;

            case 'wpncontact':
            case 'wpndistance':
                data.wpn = new ItemsModels.SchemaField({
                    dm:new ItemsModels.StringField({initial:""}),
                    attaque:new ItemsModels.SchemaField({
                        base:new ItemsModels.NumberField({initial:0}),
                        kipositif:new ItemsModels.BooleanField({initial:false}),
                        kinegatif:new ItemsModels.BooleanField({initial:false}),
                    }),
                    degats:new ItemsModels.SchemaField({
                        base:new ItemsModels.NumberField({initial:0}),
                        kipositif:new ItemsModels.BooleanField({initial:false}),
                        kinegatif:new ItemsModels.BooleanField({initial:false}),
                    }),
                });
                data.equipped = new ItemsModels.StringField({initial:""});
                data.utilisation = new ItemsModels.StringField({initial:""});
                data.dm1 = new ItemsModels.StringField({initial:""});
                data.dm2 = new ItemsModels.StringField({initial:""});
                data.for = new ItemsModels.NumberField({initial:0});
                data.prix = new ItemsModels.NumberField({initial:0});
                data.critique = new ItemsModels.NumberField({initial:20});
                break;
            case 'wpngrenade':
                data.wpn = new ItemsModels.SchemaField({
                    dm:new ItemsModels.StringField({initial:""}),
                    attaque:new ItemsModels.SchemaField({
                        base:new ItemsModels.NumberField({initial:0}),
                        kipositif:new ItemsModels.BooleanField({initial:false}),
                        kinegatif:new ItemsModels.BooleanField({initial:false}),
                    }),
                    degats:new ItemsModels.SchemaField({
                        base:new ItemsModels.NumberField({initial:0}),
                        kipositif:new ItemsModels.BooleanField({initial:false}),
                        kinegatif:new ItemsModels.BooleanField({initial:false}),
                    }),
                });
                data.equipped = new ItemsModels.StringField({initial:""});
                data.utilisation = new ItemsModels.StringField({initial:""});
                data.dm1 = new ItemsModels.StringField({initial:""});
                data.dm2 = new ItemsModels.StringField({initial:""});
                data.for = new ItemsModels.NumberField({initial:0});
                data.prix = new ItemsModels.NumberField({initial:0});
                data.critique = new ItemsModels.NumberField({initial:20});
                break;
            case 'wpnartillerie':
                data.wpn = new ItemsModels.SchemaField({
                    dm:new ItemsModels.StringField({initial:""}),
                    attaque:new ItemsModels.SchemaField({
                        base:new ItemsModels.NumberField({initial:0}),
                        kipositif:new ItemsModels.BooleanField({initial:false}),
                        kinegatif:new ItemsModels.BooleanField({initial:false}),
                    }),
                    degats:new ItemsModels.SchemaField({
                        base:new ItemsModels.NumberField({initial:0}),
                        kipositif:new ItemsModels.BooleanField({initial:false}),
                        kinegatif:new ItemsModels.BooleanField({initial:false}),
                    }),
                });
                data.equipped = new ItemsModels.StringField({initial:""});
                data.utilisation = new ItemsModels.StringField({initial:""});
                break;
        }

        return data;
    }
}