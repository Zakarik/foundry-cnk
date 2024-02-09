/**
 * @extends {ItemSheet}
 */
export class ProfilItemSheet extends ItemSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cnk", "sheet", "item", "profil"],
      template: "systems/cthulhu-no-kami/templates/profil-item-sheet.html",
      width: 800,
      height: 650,
      scrollY: [".attributes"],
      dragDrop: [{dragSelector: [".draggable"], dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    context.data.system.listType = CONFIG.CNK.TypePossible;
    context.systemData = context.data.system;

    return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('div.voies div.rang').mouseenter(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const id = header.data('id');
      const rang = target.data('rang');

      const getHtml = html.find(`div.voies div.${id} span.${rang}`);
      const position = target.position();
      const height = target.height();

      getHtml.toggle();
      getHtml.css('left', position.left);
      getHtml.css('top', position.top+height);
    });

    html.find('div.voies div.rang').mouseleave(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const id = header.data('id');
      const rang = target.data('rang');

      html.find(`div.voies div.${id} span.${rang}`).toggle();
    });

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    html.find('.item-delete').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const id = header.data('id')
      const item = this.item;
      const voies = item.system.voie;
      const valuesVoies = Object.values(voies);
      const find = valuesVoies.find(itm => itm._id === id);
      const nameEffects = Array.from({ length: 5 }, (_, i) => `${find._id}_rang${i+1}`);
      const filter = item.effects.filter(itm => nameEffects.includes(itm.name)).map(effect => effect._id);
      const filterItems = valuesVoies.filter(itm => itm._id !== id);
      let update = {};
      update[`system.voie.-=${valuesVoies.length-1}`] = null;
      update[`system.voie`] = filterItems;

      await this.item.update({[`system.voie.-=${valuesVoies.length-1}`]:null});
      await this.item.update({[`system.voie}`]:filterItems});
      this.item.deleteEmbeddedDocuments('ActiveEffect', filter);
    });

    html.find('.item-edit').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const id = header.data('id')
      const item = this.item;
      const voies = item.system.voie;
      const find = Object.values(voies).findIndex(itm => itm._id === id);
      const itm = voies[find];
      const effects = this.item.effects.filter(eff => eff.name.includes(itm._id));

      const voie = new game.cnk.documents.CNKItem(itm);

      for(let e of effects) {
        voie.effects.set(
          e._id,
          new ActiveEffect({
            _id:e._id,
            name: e.name.split('_')[1],
            icon:'',
            changes:e.changes,
            parent:voie,
            disabled:e.disabled
          })
        );
      }
      voie.system.actor = item?.actor?._id ?? null;
      voie.system.master = item._id;

      voie.sheet.render(true);
    });

    html.find(`select.famille`).change(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const value = target.val();

      let update = {};

      if(value !== "") {
        update['system'] = CONFIG.CNK.Famille[value];

        this.item.update(update);
      }
    });

    html.find(`input.atkTotal`).change(ev => {
      const target = $(ev.currentTarget);
      const value = parseInt(target.val());
      const getData = this.item.system;
      const contact = parseInt(getData.attaque.contact);
      const distance = parseInt(getData.attaque.distance);
      const total = contact+distance;
      let update = {};

      if(value < total) {
        update['system.attaque.contact'] = 0;
        update['system.attaque.distance'] = 0;

        this.item.update(update);
      }
    });

    html.find(`input.atkContact`).change(ev => {
      const target = $(ev.currentTarget);
      const contact = parseInt(target.val());
      const getData = this.item.system;
      const distance = parseInt(getData.attaque.distance);
      const atkTotal = parseInt(getData.attaque.total);
      const total = contact+distance;
      let update = {};

      if(total > atkTotal) {
        update['system.attaque.distance'] = Math.max(atkTotal-contact, 0);

        this.item.update(update);
      }
    });

    html.find(`input.atkDistance`).change(ev => {
      const target = $(ev.currentTarget);
      const distance = parseInt(target.val());
      const getData = this.item.system;
      const contact = parseInt(getData.attaque.contact);
      const atkTotal = parseInt(getData.attaque.total);
      const total = contact+distance;
      let update = {};

      if(total > atkTotal) {
        update['system.attaque.contact'] = Math.max(atkTotal-distance, 0);

        this.item.update(update);
      }
    });
  }

  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const cls = getDocumentClass(data?.type);
    if ( !cls || !(cls.collectionName in Adventure.contentFields) ) return;
    const document = await cls.fromDropData(data);
    const getData = this.item.system;
    const voie = getData.voie;
    const type = document.type;

    if(type === 'voie') {
      const id = foundry.utils.randomID();
      let length = Object.keys(voie).length;
      let update = {};
      let addEffect = [];

      update[`system.voie`] = voie
      update[`system.voie.${length}`] = document.toObject();
      update[`system.voie.${length}._id`] = id;
      update[`system.voie.${length}.-=effects`] = null;
      update[`system.voie.${length}.system.type`] = "predilection";

      this.item.update(update);

      for(let e of document.effects.contents) {
        addEffect.push({
          name: `${id}_${e.name}`,
          icon:'',
          changes:e.changes,
          disabled:true
        });
      }

      this.item.createEmbeddedDocuments('ActiveEffect', addEffect);
    }
  }

  /** @inheritdoc */
  _canDragStart(selector) {
    return this.isEditable;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _canDragDrop(selector) {
    return this.isEditable;
  }
}