import {
  setBaseImg,
  sendRoll,
  sendRollAtk,
  sendChat,
} from "../module/helpers/common.mjs";
/**
 * @extends {ActorSheet}
 */
export class VehiculeActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cnk", "sheet", "actor", "vehicule"],
      template: "systems/cthulhu-no-kami/templates/vehicule-actor-sheet.html",
      width: 1050,
      height: 600,
      tabs: [
        {navSelector: ".tabs", contentSelector: ".body", initial: "presentation"},
        {navSelector: ".tabCombat", contentSelector: ".combat", initial: "toutes"}
      ],
      dragDrop: [{dragSelector: [".draggable", ".item-list .item"], dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    this._prepareCharacterItems(context);

    Object.assign(context.data.system.listequipage, context.data.system.passagers, context.data.system.pilote);
    context.systemData = context.data.system;

    console.warn(context);

    return context;
  }

  /** @inheritdoc */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();

    return buttons;
  }

  /**
     * Return a light sheet if in "limited" state
     * @override
     */
  get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/cthulhu-no-kami/templates/vehicule-limited-sheet.html";
    }
    return this.options.template;
  }

  get hasWpnEquipped() {
    let i = 0;

    if(this.actor.system.wpnequipped === '1main') i = 1;
    else if(this.actor.system.wpnequipped === '2mains') i = 2;

    return i;
  }

  get listWpnEquipped() {
    const allItems = this.actor.items;
    let i = allItems.filter(itm => CONFIG.CNK.ListWpnCanBeEquipped.includes(itm.type) && itm.system.equipped !== "").length;

    return i;
  }

  get listWpnUsed() {
    const result = this.actor.system?.listwpnequipped ?? [];

    return result;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    html.find('i.fa-message').hover(ev => {
      const target = $(ev.currentTarget);
      target.toggleClass('fa-regular');
      target.toggleClass('fa-solid');
    });

    html.find('.sendmsg').click(ev => {
      const target = $(ev.currentTarget);
      const title = target.data("title");
      const msg = target.data("msg");
      const type = target.data("type");
      let header;
      let itm;
      let msgSpecial = "";
      let dm;
      let utilisation;

      if(type !== undefined) {
        switch(type) {
          case 'wpncontact':
            header = $(ev.currentTarget).parents(".summary");
            itm = this.actor[type].find(item => item._id === header.data("item-id"));
            if(itm === undefined) itm = this.actor.wpnequipped.find(item => item._id === header.data("item-id"));
            dm = '1D6';
            utilisation = itm.system.utilisation;

            if(itm.system.dm !== "" && itm.system.utilisation !== '1mainou2mains') dm = itm.system.dm;
            if(itm.system.utilisation === '1mainou2mains') {
              const dm1 = itm.system?.dm1 ?? "";
              const dm2 = itm.system?.dm2 ?? "";

              if(dm1 === '') dm = '1D6';
              else dm = dm1;
              if(dm2 === '') dm += ' / 1D6';
              else dm += ` / ${dm2}`;
            }

            if(utilisation !== "") utilisation = game.i18n.localize(`CNK.UTILISATIONS.${utilisation}`);
            else utilisation = "";

            msgSpecial += `<div class="grid">`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Utilisation`)}</p>`;
            msgSpecial += `<p class="value">${utilisation}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Dm`)}</p>`;
            msgSpecial += `<p class="value">${dm}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ForMin`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.for}</p>`;
            if(itm.system.attaque.total > 0) {
              msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ModAtt-short`)}</p>`;
              msgSpecial += `<p class="value">${itm.system.attaque.total}</p>`;
            }

            if(itm.system.degats.total > 0) {
              msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ModDgt-short`)}</p>`;
              msgSpecial += `<p class="value">${itm.system.degats.total}</p>`;
            }

            msgSpecial += `</div>`;
            msgSpecial += itm.system.description;

            sendChat(this.actor, itm.name, msgSpecial);
            break;
          case 'wpndistance':
            header = $(ev.currentTarget).parents(".summary");
            itm = this.actor[type].find(item => item._id === header.data("item-id"));
            if(itm === undefined) itm = this.actor.wpnequipped.find(item => item._id === header.data("item-id"));
            dm = '1D6';
            utilisation = itm.system.utilisation;

            if(itm.system.dm !== "" && utilisation !== '1mainou2mains') dm = itm.system.dm;
            if(utilisation === '1mainou2mains') {
              const dm1 = itm.system?.dm1 ?? "";
              const dm2 = itm.system?.dm2 ?? "";

              if(dm1 === '') dm = '1D6';
              else dm = dm1;
              if(dm2 === '') dm += ' / 1D6';
              else dm += ` / ${dm2}`;
            }

            if(utilisation !== "") utilisation = game.i18n.localize(`CNK.UTILISATIONS.${utilisation}`);
            else utilisation = "";

            msgSpecial += `<div class="grid">`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Utilisation`)}</p>`;
            msgSpecial += `<p class="value">${utilisation}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Dm`)}</p>`;
            msgSpecial += `<p class="value">${dm}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ForMin`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.for}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Portee`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.portee}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Rechargement`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.rechargement}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Incident`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.incident}</p>`;
            if(itm.system.attaque.total > 0) {
              msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ModAtt-short`)}</p>`;
              msgSpecial += `<p class="value">${itm.system.attaque.total}</p>`;
            }

            if(itm.system.degats.total > 0) {
              msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ModDgt-short`)}</p>`;
              msgSpecial += `<p class="value">${itm.system.degats.total}</p>`;
            }

            msgSpecial += `</div>`;
            msgSpecial += itm.system.description;

            sendChat(this.actor, itm.name, msgSpecial);
            break;
          case 'wpngrenade':
            header = $(ev.currentTarget).parents(".summary");
            itm = this.actor[type].find(item => item._id === header.data("item-id"));
            if(itm === undefined) itm = this.actor.wpnequipped.find(item => item._id === header.data("item-id"));
            dm = '1D6';
            utilisation = itm.system.utilisation;

            if(itm.system.dm !== "" && utilisation !== '1mainou2mains') dm = itm.system.dm;
            if(utilisation === '1mainou2mains') {
              const dm1 = itm.system?.dm1 ?? "";
              const dm2 = itm.system?.dm2 ?? "";

              if(dm1 === '') dm = '1D6';
              else dm = dm1;
              if(dm2 === '') dm += ' / 1D6';
              else dm += ` / ${dm2}`;
            }

            if(utilisation !== "") utilisation = game.i18n.localize(`CNK.UTILISATIONS.${utilisation}`);
            else utilisation = "";

            msgSpecial += `<div class="grid">`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Utilisation`)}</p>`;
            msgSpecial += `<p class="value">${utilisation}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Dm`)}</p>`;
            msgSpecial += `<p class="value">${dm}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Portee`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.portee}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Rechargement`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.rechargement}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ForMin`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.for}</p>`;
            if(itm.system.attaque.total > 0) {
              msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ModAtt-short`)}</p>`;
              msgSpecial += `<p class="value">${itm.system.attaque.total}</p>`;
            }

            if(itm.system.degats.total > 0) {
              msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ModDgt-short`)}</p>`;
              msgSpecial += `<p class="value">${itm.system.degats.total}</p>`;
            }

            msgSpecial += `</div>`;
            msgSpecial += itm.system.description;

            sendChat(this.actor, itm.name, msgSpecial);
          break;
          case 'wpnartillerie':
            header = $(ev.currentTarget).parents(".summary");
            itm = this.actor[type].find(item => item._id === header.data("item-id"));
            if(itm === undefined) itm = this.actor.wpnequipped.find(item => item._id === header.data("item-id"));
            dm = '1D6';

            if(itm.system.dm !== "") dm = itm.system.dm;

            msgSpecial += `<div class="grid">`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Utilisation`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.utilisation}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Dm`)}</p>`;
            msgSpecial += `<p class="value">${dm}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Portee`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.portee}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.Rechargement`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.rechargement}</p>`;
            if(itm.system.attaque.total > 0) {
              msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ModAtt-short`)}</p>`;
              msgSpecial += `<p class="value">${itm.system.attaque.total}</p>`;
            }

            if(itm.system.degats.total > 0) {
              msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.ModDgt-short`)}</p>`;
              msgSpecial += `<p class="value">${itm.system.degats.total}</p>`;
            }

            msgSpecial += `</div>`;
            msgSpecial += itm.system.description;

            sendChat(this.actor, itm.name, msgSpecial);
          break;
          case 'sortilege':
            header = $(ev.currentTarget).parents(".summary");
            itm = this.actor[type].find(item => item._id === header.data("item-id"));

            msgSpecial += `<div class="grid">`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.SORTILEGE.Rang`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.rang}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.SORTILEGE.Type`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.type}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.SORTILEGE.Forme`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.forme}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.SORTILEGE.DifficulteForme`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.difficulte.forme}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.TABSCOMBAT.SORTILEGE.DifficulteCanalisation`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.difficulte.canalisation}</p>`;

            msgSpecial += `</div>`;
            msgSpecial += itm.system.description;

            sendChat(this.actor, itm.name, msgSpecial);
            break;
          case 'armure':
            header = $(ev.currentTarget).parents(".summary");
            itm = this.actor.armures.find(item => item._id === header.data("item-id"));

            msgSpecial += `<div class="grid">`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.COMBAT.Defense`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.defense}</p>`;
            msgSpecial += `<p class="label">${game.i18n.localize(`CNK.COMBAT.Reduction`)}</p>`;
            msgSpecial += `<p class="value">${itm.system.reduction}</p>`;

            msgSpecial += `</div>`;
            msgSpecial += itm.system.description;

            sendChat(this.actor, itm.name, msgSpecial);
            break;
        }
      } else sendChat(this.actor, title, msg);
    });

    html.find('select.userSelect').change(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const item = this.actor.items.get(header.data("item-id"));
      const value = target.val();

      item.update({['system.user']:value});
    });

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.item-edit').click(ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const item = this.actor.items.get(header.data("item-id"));

      item.sheet.render(true);
    });

    html.find('.item-delete').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const item = this.actor.items.get(header.data("item-id"));

      item.delete();
      header.slideUp(200, () => this.render(false));
    });

    html.find(`button.extend`).click(ev => {
      ev.preventDefault();
      const header = $(ev.currentTarget).parents(".summary");
      const item = this.actor.items.get(header.data("item-id"));
      const isExtended = item.system?.extended ?? false;
      const newValue = isExtended ? false : true;
      const showOrHide = newValue ? "show" : "hide";

      header.find("span.description").animate({
        height:showOrHide
      });

      setTimeout(function() {
        item.update({['system.extended']:newValue});
      }, 400);
    });

    html.find(`button.mode-edition`).click(ev => {
      ev.preventDefault();
      const hasEdit = this.actor.system?.edit ?? false;
      let result = hasEdit ? false : true;

      let update = {}

      update['system.edit'] = result

      this.actor.update(update);
    });

    html.find(`i.btnPilot`).click(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const id = target.data("id");
      const passagers = this.actor.system?.listpassagers ?? [];
      const filter = passagers.filter(itm => itm !== id);
      const newPilot = passagers.filter(itm => itm === id);
      let listPilot = this.actor.system?.listpilote ?? [];
      listPilot = listPilot.concat(newPilot);
      let update = {};

      update['system.listpassagers'] = filter;
      update['system.listpilote'] = listPilot;

      console.warn(listPilot, update);

      this.actor.update(update);
    });

    html.find(`i.delPilot`).click(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const id = target.data("id");
      const listPilot = this.actor.system?.listpilote ?? [];
      const filter = listPilot.filter(itm => itm !== id);
      let update = {};

      update['system.listpilote'] = filter;

      this.actor.update(update);
    });

    html.find(`i.btnPassager`).click(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const id = target.data("id");
      const pilote = this.actor.system?.listpilote ?? [];
      const filter = pilote.filter(itm => itm !== id);
      const newPassager = pilote.filter(itm => itm === id);
      let listPassagers = this.actor.system?.listpassagers ?? [];
      listPassagers = listPassagers.concat(newPassager);
      let update = {};

      update['system.listpassagers'] = listPassagers;
      update['system.listpilote'] = filter;

      this.actor.update(update);
    });

    html.find(`i.delPassager`).click(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const id = target.data("id");
      const listPassagers = this.actor.system?.listpassagers ?? [];
      const filter = listPassagers.filter(itm => itm !== id);
      let update = {};

      update['system.listpassagers'] = filter;

      this.actor.update(update);
    });

    html.find('.roll').click(async ev => {
      const target = $(ev.currentTarget);
      const title = target.data('title');
      const rMentale = target?.data('rtype') ?? false;
      const system = this.actor.system;
      const diceUsed = system?.roll?.modDice ?? 20;
      const pilote = system.listpilote;
      const getPilote = game.actors.get(pilote[0]);
      let base = 0;
      let rollWButtons = "";

      if(getPilote !== undefined) {
        base = getPilote.system.caracteristiques.dexterite.modificateur+system.caracteristiques.agilite.total;
      }

      const bRoll = [];
      const bRollC = [];
      let data = {
        content:{}
      };
      data.title = title;
      data.base = base;
      data.content.listDice = {
        '12':`${game.i18n.localize(`CNK.De-short`)}12`,
        '20':`${game.i18n.localize(`CNK.De-short`)}20`,
      };
      data.content.dice = diceUsed;
      data.content.nbreDe = 1;
      data.content.bRoll = [];
      data.canUseChance = rMentale ? false : true;
      data.rollWButtons = rollWButtons;
      let i = 0;

      for(let r of bRoll) {
        data.content.bRoll.push({
          id:i,
          active:r?.active ?? false,
          name:r.name,
          value:r.value,
        });

        i++;
      }

      for(let r of bRollC) {
        data.content.bRoll.push({
          id:i,
          active:r?.active ?? false,
          name:r.name,
          value:r.value,
        });

        i++;
      }

      sendRoll(this.actor, data);
    });

    html.find('.rollAtk').click(async ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const main = target.data('main');
      const type = target.data('type');
      const title = target.data('title');
      const wpntype = target.data('wpn-type');
      const wpn = header.data("item-id");
      const getWpnData = this.actor.items.get(wpn);
      const actor = this.actor;
      const user = game.actors.get(getWpnData.system.user);

      if(user === undefined) return;

      const tgt = game.user.targets;
      const iterator = tgt.values();
      const token = iterator?.next()?.value?.document ?? undefined;
      const system = user.system;
      const dataRoll = wpntype !== 'sortilege' && actor.system.listpilote.includes(getWpnData.system.user) ? user.system.caracteristiques.dexterite.modificateur+actor.system.caracteristiques.agilite.total : system[main][type];
      const base = wpntype === 'sortilege' ? dataRoll.modificateur : dataRoll?.total ?? dataRoll;
      const bRoll = dataRoll?.bonusRoll ?? [];
      const bRollC = dataRoll?.bonusRollCondition ?? [];
      const bRoll2 = wpntype === 'sortilege' ? system.combat.magique?.bonusRoll ?? [] : [];
      const bRoll2C = wpntype === 'sortilege' ? system.combat.magique?.bonusRollCondition ?? []  : [];
      let diceUsed = system?.roll?.modDice ?? 20;

      let data = {
        content:{}
      };
      data.title = title;
      data.base = base;
      data.content.listDice = {
        '12':`${game.i18n.localize(`CNK.De-short`)}12`,
        '20':`${game.i18n.localize(`CNK.De-short`)}20`,
      };
      data.content.dice = diceUsed;
      data.content.nbreDe = 1;
      data.content.bRoll = [];
      data.content.bRoll2 = [];
      data.content.type = wpntype;
      data.canUseChance = true;
      data.target = token;
      data.wpn = wpn;
      data.vehicule = actor._id;
      data.user = user._id;
      let i = 0;
      let n = 0;

      if(wpntype === 'wpndistance') {
        data.content.bRoll.push({
          id:i,
          active:false,
          name:game.i18n.localize(`CNK.ROLL.Couvert`),
          value:-2,
        });

        i++;

        data.content.bRoll.push({
          id:i,
          active:false,
          name:game.i18n.localize(`CNK.ROLL.CibleProche`),
          value:-2,
        });

        i++;

        data.content.bRoll.push({
          id:i,
          active:false,
          name:game.i18n.localize(`CNK.ROLL.CibleMasqueeAllie`),
          value:-5,
        });

        i++;

        data.content.bRoll.push({
          id:i,
          active:false,
          name:game.i18n.localize(`CNK.ROLL.Penombre`),
          value:-5,
        });

        i++;

        data.content.bRoll.push({
          id:i,
          active:false,
          name:game.i18n.localize(`CNK.ROLL.NoirTotal`),
          value:-10,
        });

        i++;

        data.content.bRoll.push({
          id:i,
          active:false,
          name:game.i18n.localize(`CNK.ROLL.DoublePortee`),
          value:-5,
        });

        i++;

        data.content.bRoll.push({
          id:i,
          active:false,
          name:game.i18n.localize(`CNK.ROLL.TriplePortee`),
          value:-10,
        });
      } else if(wpntype === 'wpnartillerie') {
        data.content.bRoll.push({
          id:i,
          active:false,
          name:game.i18n.localize(`CNK.ROLL.ManqueDeuxHommes`),
          value:-5,
        });

        i++;
      } else if(wpntype === 'wpngrenade') {
        data.content.cible = '10';
      }

      for(let r of bRoll) {
        data.content.bRoll.push({
          id:i,
          active:wpntype === 'sortilege' ? false : r?.active ?? false,
          name:r.name,
          value:r.value,
        });

        i++;
      }

      for(let r of bRollC) {
        data.content.bRoll.push({
          id:i,
          active:wpntype === 'sortilege' ? false : r?.active ?? false,
          name:r.name,
          value:r.value,
        });

        i++;
      }

      for(let r of bRoll2) {
        data.content.bRoll2.push({
          id:n,
          active:r?.active ?? false,
          name:r.name,
          value:r.value,
        });

        n++;
      }

      for(let r of bRoll2C) {
        data.content.bRoll2.push({
          id:n,
          active:r?.active ?? false,
          name:r.name,
          value:r.value,
        });

        n++;
      }

      sendRollAtk(actor, data);
    });
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `${game.i18n.localize(`TYPES.Item.${type}`)}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
      img: setBaseImg(type)
    };

    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  _onDragStart(event) {
    const li = event.currentTarget;
    if ( event.target.classList.contains("content-link") ) return;

    // Create drag data
    let dragData;

    // Owned Items
    if ( li.dataset.itemId ) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }

    // Active Effect
    if ( li.dataset.effectId ) {
      const effect = this.actor.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if ( !dragData ) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  async _onDropItemCreate(itemData) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    const data = itemData[0];
    const itemBaseType = data.type;

    if(itemBaseType === 'profil') return;
    if(itemBaseType === 'voie') return;
    if(itemBaseType === 'trait') return;
    if(itemBaseType === 'folie') return;
    if(itemBaseType === 'phobie') return;
    if(itemBaseType === 'sortilege') return;
    if(itemBaseType === 'armure') return;
    if(itemBaseType === 'objet') return;

    const itemCreate = await this.actor.createEmbeddedDocuments("Item", itemData);

    return itemCreate;
  }

  /** @inheritdoc */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const cls = getDocumentClass(data?.type);
    const document = await cls.fromDropData(data);
    const actor = this.actor;
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    const type = document.type;
    if ( allowed === false ) return;

    if(type === 'eiyu') {
      const passagers = this.actor.system?.listpassagers ?? [];
      const pilote = this.actor.system?.listpilote ?? [];
      const all = [].concat(passagers, pilote);
      const places = this.actor.system.derives.places.actuel;

      if(places === 0) {
        ui.notifications.error(game.i18n.localize(`CNK.VEHICULE.PasPlace`));
        return;
      }

      if(!all.includes(document.id)) {
        passagers.push(document.id);
        this.actor.update({['system.listpassagers']:passagers});
      } else {
        ui.notifications.error(game.i18n.localize(`CNK.VEHICULE.DejaABord`));
      }
    }

    // Handle different data types
    switch ( data.type ) {
      case "ActiveEffect":
        return this._onDropActiveEffect(event, data);
      case "Actor":
        return this._onDropActor(event, data);
      case "Item":
        return this._onDropItem(event, data);
      case "Folder":
        return this._onDropFolder(event, data);
    }
  }

  async _prepareCharacterItems(actorData) {
    const system = actorData.data.system;
    const pilote = system?.listpilote ?? [];
    const defense = system.combat.defense?.base ?? 0;
    let update = {}

    if(pilote.length > 0) {
      const getPilote = game.actors.get(pilote[0]);
      const getDex = getPilote === undefined ? 0 : getPilote.system.caracteristiques.dexterite.modificateur;

      if(getDex !== defense) update['system.combat.defense.base'] = getDex;
    } else if(defense !== 0) update['system.combat.defense.base'] = 0;

    if(Object.values(update).length > 0) this.actor.update(update)

    const equipage = [].concat(system.listpilote, system.listpassagers);
    const items = actorData.items;
    let wpnall = [];
    let wpncontact = [];
    let wpndistance = [];
    let wpngrenade = [];
    let wpnartillerie = [];

    for (let i of items) {
      const type = i.type;
      const data = i.system;

      switch(type) {
        case "wpncontact":
        case "wpndistance":
        case "wpngrenade":
        case "wpnartillerie":
          const user = data?.user ?? "";
          if(user !== "" && !equipage.includes(user)) data.user = "";

          wpnall.push(i);

          if(type === 'wpncontact') wpncontact.push(i);
          else if(type === 'wpndistance') wpndistance.push(i);
          else if(type === 'wpngrenade') wpngrenade.push(i);
          else if(type === 'wpnartillerie') wpnartillerie.push(i);
          break;
      }
    };

    actorData.actor.wpnall = wpnall;
    actorData.actor.wpncontact = wpncontact;
    actorData.actor.wpndistance = wpndistance;
    actorData.actor.wpngrenade = wpngrenade;
    actorData.actor.wpnartillerie = wpnartillerie;
  }
}