import {
  prepareMod,
  prepareModJet,
  setValueByPath,
  generateID,
} from "../module/helpers/common.mjs";
/**
 * @extends {ItemSheet}
 */
export class VoieItemSheet extends ItemSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cnk", "sheet", "item", "voie"],
      template: "systems/cthulhu-no-kami/templates/voie-item-sheet.html",
      width: 700,
      height: 550,
      scrollY: [".attributes"],
      tabs: [
        {navSelector: ".tabs", contentSelector: ".body", initial: "rang1"},
        {navSelector: ".rang1_tabs", contentSelector: ".rang1_body", initial: "base"},
        {navSelector: ".rang2_tabs", contentSelector: ".rang2_body", initial: "base"},
        {navSelector: ".rang3_tabs", contentSelector: ".rang3_body", initial: "base"},
        {navSelector: ".rang4_tabs", contentSelector: ".rang4_body", initial: "base"},
        {navSelector: ".rang5_tabs", contentSelector: ".rang5_body", initial: "base"},
      ],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    prepareMod(context.item);
    prepareModJet(context.item);
    this._prepareEffects(context);

    context.systemData = context.data.system;

    return context;
  }

  /* -------------------------------------------- */

  get hasMaster() {
    return this.item.system.master === undefined ? false : true;
  }

  get getMaster() {
    const actor = this.getActor;
    const id = this.item.system?.master ?? undefined;

    let result = undefined;
    if(this.hasMaster) result = actor !== null ? actor.items.get(id) : game.collections.get('Item').get(id);

    return result;
  }

  get getActor() {
    const id = this.item.system?.actor ?? null;
    let result = null;

    if(id !== null) result = game.collections.get('Actor').get(id);

    return result;
  }

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    html.find(`i.addMod`).click(ev => {
      ev.preventDefault();
      const data = $(ev.currentTarget).parents('.modificateurBlock').data("key");
      const state = this.item.system?.listrang[data].state ?? '0';

      if(state === '0') {
        this._createEffects(data);
      } else {
        const effect = this.item.effects.find(itm => itm.name === data);
        const changes = effect.changes;

        changes.push({
          key: ``,
          mode: 2,
          priority: null,
          value: '0'
        });

        this._updateEffects(effect._id, changes);
      }
    });

    html.find(`i.deleteMod`).click(ev => {
      ev.preventDefault();
      const data = $(ev.currentTarget).parents('.modificateurBlock').data("key");
      const header = $(ev.currentTarget).parents(".effectsChanges");
      const key = header.data("key");
      const id = header.data("id");
      const effect = this.item.effects.find(effects => effects._id === id && effects.name === data);
      effect.changes.splice(key, 1);

      this._updateEffects(id, effect.changes);
    });

    html.find(`button.btnEdit`).click(ev => {
      ev.preventDefault();
      const data = $(ev.currentTarget).parents('.modificateurBlock').data("key");

      let edit = this.item.system?.listrang[data].edit ?? false;
      let value = edit ? false : true;
      let update = {};
      update[`system.listrang.${data}.edit`] = value;

      this._updateThis(update);
    });

    html.find(`button.saveMod`).click(ev => {
      ev.preventDefault();
      const data = $(ev.currentTarget).parents('.modificateurBlock').data("key");
      const select = $(ev.currentTarget).parents('.modificateurBlock').find(`div.effectsBlock select`);
      const input = $(ev.currentTarget).parents('.modificateurBlock').find(`div.effectsBlock input`);
      let id = "";
      let changes = {};
      let finalChanges = [];

      for(let i of select) {
          const dataS = $(i);
          const keyS = dataS.data("key");
          const idS = dataS.data("id");
          const valS = dataS.val();

          id = idS;
          changes[keyS] = {
          key: valS,
          mode: 2,
          priority: null,
          value: 0
          };
      }

      for(let i of input) {
          const dataI = $(i);
          const keyI = dataI.data("key");
          const valI = dataI.val();

          changes[keyI].value = valI;
      }

      for(let f in changes) {
          finalChanges.push(changes[f]);
      }

      if(id === "") {
        for(let e of data.effects.contents) {
          this._updateEffects(e._id, []);
        }
      } else {
        this._updateEffects(id, finalChanges);
      }
    });

    html.find(`.btn.toActive`).click(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const name = target.data("name");
      const rang = target.data("rang");
      const value = this.item.system.listrang[rang]?.[name] ?? false;
      const newValue = value ? false : true;
      let update = {};
      update[`system.listrang.${rang}.${name}`] = newValue;

      this._updateThis(update);
    });

    html.find(`i.addModJet`).click(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const data = target.parents('.modificateurJetBlock').data("key");
      const listModJet = this.item.system.listrang[data]?.modjet?.list ?? {};
      const length = Object.values(listModJet).length;
      let update = {};
      update[`system.listrang.${data}.modjet.list.${length}`] = {
        _id:generateID(),
        key:"",
        value:0,
        condition:"",
        path:`system.listrang.${data}.modjet`,
      };

      this._updateThis(update);
    });

    html.find(`i.deleteModJet`).click(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const key = target.parents('.modificateurJetBlock').data("key");
      const id = target.data('id');
      const listModJet = this.item.system.listrang[key].modjet.list;
      const toArray = Object.keys(listModJet);
      const mods = [];
      let update = {};
      let i = 0;

      for(let d in toArray) {
        const k = toArray[d];
        const data = listModJet[k];
        if(data._id === id) continue;

        mods.push(data);
        update[`system.listrang.${key}.modjet.list.${i}`] = data;
        i++;
      }

      update[`system.listrang.${key}.modjet.list.-=${toArray.length-1}`] = null;

      this._updateThis(update);
    });

    html.find(`button.btnEditJet`).click(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const data = target.parents('.modificateurJetBlock').data("key");
      let edit = this.item.system.listrang[data].modjet?.edit ?? false;
      let value = edit ? false : true;

      this._updateThis({[`system.listrang.${data}.modjet.edit`]:value});
    });

    html.find(`button.btnSelonRang`).click(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const data = target.parents('.modificateurJetBlock').data("key");
      const id = target.data('id');
      const liste = this.item.system.listrang[data].modjet.list;
      const find = Object.values(liste).findIndex(itm => itm._id === id);
      let oldValue = this.item.system.listrang[data].modjet.list[find]?.selonrang ?? false;
      let value = oldValue ? false : true;

      this._updateThis({[`system.listrang.${data}.modjet.list.${find}.selonrang`]:value});
    });
  }

  _prepareEffects(context) {
    const system = context.data.system;
    const mods = this.item.listMod;
    const modjet = this.item.listModJet;

    for(let r in system.listrang) {
      const filter = this.item.effects.filter(itm => itm.name === r);

      system.listrang[r].data = {
        key:r,
        effects: filter,
        edit:system.listrang[r].edit,
        mods:mods,
        listModJet:modjet,
        modjet:{
          edit:system.listrang[r]?.modjet?.edit ?? false,
          list:system.listrang[r]?.modjet?.list ?? {},
        }
      }
    }
  }

  /** @inheritdoc */
  async _updateObject(event, formData) {
    if(this.hasMaster) {
      if($(event.currentTarget).hasClass('effect')) return;

      const getItm = this.getMaster;
      const getAllVoie = getItm.system.voie;
      const getVoieIndex = Object.values(getAllVoie).findIndex(itm => itm._id === this.item._id);

      let update = {};

      for(let o of Object.keys(formData)) {

        if(o.includes('.effects.')) {
          const split = o.split('.');
          const pos = split[2];
          const subpos = split[4];
          const effect = this.item.effects.contents[pos];
          effect.changes[subpos].key = formData[o][0];
          effect.changes[subpos].value = formData[o][1];

          this.item.effects.set(
            effect._id,
            effect
          );
        } else {
          update[`system.voie.${getVoieIndex}.${o}`] = formData[o];
          setValueByPath(this.item, o, formData[o]);
        }
      }

      getItm.update(update);
      this.render(true);
    } else {
      if ( !this.object.id ) return;
      return this.object.update(formData);
    }
  }

  /**
   * Handle saving the content of a specific editor by name
   * @param {string} name           The named editor to save
   * @param {boolean} [remove]      Remove the editor after saving its content
   * @returns {Promise<void>}
   */
  async saveEditor(name, {remove=true}={}) {
    const editor = this.editors[name];
    if ( !editor || !editor.instance ) throw new Error(`${name} is not an active editor name!`);
    editor.active = false;
    const instance = editor.instance;
    await this._onSubmit(new Event("submit"));

    // Remove the editor
    if ( remove ) {
      instance.destroy();
      editor.instance = editor.mce = null;
      if ( editor.hasButton ) editor.button.style.display = "block";
      this.render();
    }
    editor.changed = false;
  }

  _updateEffects(id, changes) {
    if(this.hasMaster) {
      const getActor = this.getActor;
      const getMaster = this.getMaster;
      const getEffect = this.item.effects.get(id);
      const getMasterEffects = getMaster.effects.find(itm => itm.name === `${this.item._id}_${getEffect.name}`);

      getEffect.changes = changes;
      this.item.effects.set(id, getEffect);
      getMaster.updateEmbeddedDocuments('ActiveEffect', [{
        "_id":getMasterEffects._id,
        icon:'',
        changes:getEffect.changes,
      }]);
      this.item.render(true);

      if(getActor !== null) {
        const getActorEffects = getActor.effects.find(itm => itm.name === `${this.item._id}_${getEffect.name}`);

        getActor.updateEmbeddedDocuments('ActiveEffect', [{
          "_id":getActorEffects._id,
          icon:'',
          changes:getEffect.changes,
        }]);
      }
    } else {
      this.item.updateEmbeddedDocuments('ActiveEffect', [{
        "_id":id,
        icon:'',
        changes:changes
      }]);
    }
  }

  _createEffects(name) {
    if(this.hasMaster) {
      const getActor = this.getActor;
      const getMaster = this.getMaster;
      const getAllVoie = getMaster.system.voie;
      const getVoieIndex = Object.keys(getAllVoie).findIndex(itm => itm._id === itm._id);
      const id = foundry.utils.randomID();

      this.item.effects.set(
        id,
        new ActiveEffect({
          _id:id,
          name: name,
          icon:'',
          changes:[{
            key: ``,
            mode: 2,
            priority: null,
            value: 0
          }],
          parent:this.item,
          disabled:true
        })
      );

      let updateEffects = {
        name: `${this.item._id}_${name}`,
        icon:'',
        changes:[{
          key: ``,
          mode: 2,
          priority: null,
          value: 0
        }],
        disabled:true
      };
      this.item.system.listrang[name].state = 1;

      getMaster.createEmbeddedDocuments('ActiveEffect', [updateEffects]);
      getMaster.update({[`system.voie.${getVoieIndex}.system.listrang.${name}.state`]:1});

      this.item.render(true);

      if(getActor !== null) {
        let updateActorEffects = {
          name: `${this.item._id}_${name}`,
          icon:'',
          changes:[{
            key: ``,
            mode: 2,
            priority: null,
            value: 0
          }],
          origin:`Actor.${getActor._id}.Item.${getMaster._id}`,
          disabled:true
        };

        getActor.createEmbeddedDocuments('ActiveEffect', [updateActorEffects]);
      }
    } else {
      this.item.createEmbeddedDocuments('ActiveEffect', [{
        name: name,
        icon:'',
        changes:[{
          key: ``,
          mode: 2,
          priority: null,
          value: 0
        }],
        disabled:true
      }]);

      this.item.update({[`system.listrang.${name}.state`]:'1'});
    }
  }

  _updateThis(toUpdate) {
    if(this.hasMaster) {
      const getItm = this.getMaster;
      const getAllVoie = getItm.system.voie;
      const getVoieIndex = Object.values(getAllVoie).findIndex(itm => itm._id === this.item._id);
      let update = {};

      for(let u in toUpdate) {
        const completePath = `system.voie.${getVoieIndex}.${u}`;
        update[completePath] = toUpdate[u];
        setValueByPath(this.item, u, toUpdate[u]);
      }

      getItm.update(update);
      this.render(true);
    } else this.item.update(toUpdate);
  }
}