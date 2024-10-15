import {
  setBaseImg,
  activeOrUnactiveEffect,
  sendChat,
  sendRoll,
  sendRollAtk,
  getNumberWpnEquipped,
  doRoll,
} from "../module/helpers/common.mjs";
/**
 * @extends {ActorSheet}
 */
export class EiyuActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cnk", "sheet", "actor", "eiyu"],
      template: "systems/cthulhu-no-kami/templates/eiyu-actor-sheet.html",
      width: 1150,
      height: 800,
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
    this._prepareDefense(context);

    if(this.actor.system.modecreation === 1) {
      const settings = game.settings.get('cthulhu-no-kami','methode-creation');
      context.data.system.settingsPonderee = settings === 'AleatoirePonderee' ? true : false;
      context.data.system.settingsRepartition = settings === 'Repartition' ? true : false;
    }
    if(this.actor.system.modecreation === 3) {
      this._calculPC(context);
    }

    context.systemData = context.data.system;
    this._listCaracs(context);

    console.warn(context);

    return context;
  }

  /** @inheritdoc */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();

    if ( this.options.editable && !this.actor.limited ) {
      buttons.unshift({
        label:'CNK.TITRE.Creation-personnage',
        class:'create-character',
        icon:'fa-solid fa-circle-plus',
        onclick: ev => {
          this.actor.update({['system.modecreation']:1});
        }
      })
    }

    return buttons;
  }

  /**
     * Return a light sheet if in "limited" state
     * @override
     */
  get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/cthulhu-no-kami/templates/eiyu-limited-sheet.html";
    }
    return this.options.template;
  }

  get ki() {
    return parseInt(this.actor.system.derives.ki.actuel);
  }

  get profil() {
    return this.actor.items.find(items => items.type === 'profil');
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

    html.find('div.voies div.listvoie div.rang').mouseenter(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const id = header.data('id');
      const rang = target.data('rang');

      const getHtml = html.find(`div.voies div.listvoie div.${id} span.${rang}`);
      const position = target.position();
      const height = target.height();

      getHtml.toggle();
      getHtml.css('left', position.left);
      getHtml.css('top', position.top+height);
    });

    html.find('div.voies div.listvoie div.rang').mouseleave(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const id = header.data('id');
      const rang = target.data('rang');

      html.find(`div.voies div.listvoie div.${id} span.${rang}`).toggle();
    });

    html.find('div.modecreation-listvoie div.rang').mouseenter(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const id = header.data('id');
      const rang = target.data('rang');

      const getHtml = html.find(`div.modecreation-listvoie div.${id} span.${rang}`);
      const position = target.position();
      const height = target.height();

      getHtml.toggle();
      getHtml.css('left', position.left);
      getHtml.css('top', position.top+height);
    });

    html.find('div.modecreation-listvoie div.rang').mouseleave(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const id = header.data('id');
      const rang = target.data('rang');

      html.find(`div.modecreation-listvoie div.${id} span.${rang}`).toggle();
    });

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    html.find('.rollCaracteristiques').click(async ev => {
      const actor = this.actor;
      const settings = game.settings.get('cthulhu-no-kami','methode-creation');
      let toUpdate = [];
      let formula = '';
      let bonus = '';
      let n = 3;

      switch(settings) {
        case 'Aleatoire':
        case 'AleatoirePonderee':
          n = 6;
          formula = '4D6kh3';
          bonus = '4D6';
          break;
        default:
          n = 3;
          formula = '2D6 + 6';
          bonus = '2D6 + 6';
          break;
      }

      for(let i = 0;i < n;i++) {
        let data = {
          stringify:JSON.stringify({
            title:this.actor.name,
            formula:formula,
            canUseChance:false,
            template:'systems/cthulhu-no-kami/templates/roll/simple.html',
          }),
          direct:true,
          canUseChance:false,
          formula:formula,
          template:'systems/cthulhu-no-kami/templates/roll/simple.html',
          echecCritique:[],
          noSpecial:true,
          pRoll:{
            flavor:this.actor.name,
            listBonus:[bonus],
          }
        }

        const result = await doRoll(actor, data);

        if(settings === 'Aleatoire')  toUpdate.push(Math.max(result.totalRoll, 8));
        else toUpdate.push(result.totalRoll, 19-result.totalRoll)
      };

      let update = {};
      update['system.rolledCaracteristiques'] = toUpdate;

      this.actor.update(update);
    });

    html.find('.modecreation-next').click(async ev => {
      const settings = game.settings.get('cthulhu-no-kami','methode-creation');
      const value = this.actor.system.modecreation;
      let result = value+1;
      let update = {};

      if(result > 3) {
        const chance = parseInt(this.actor.system.derives.chance.mod);
        const bonusChance = this.actor.system?.['modecreation-chance'] ?? 0;

        if(settings === 'AleatoirePonderee') update['system.derives.chance.mod'] = chance+bonusChance;

        update['system.-=modecreation'] = null;
        update['system.-=rolledCaracteristiques'] = null;
        update['system.-=modecreation-chance'] = null;
      } else {
        update['system.modecreation'] = result;
      }

      this.actor.update(update);
    });

    html.find('.modecreation-annuler').click(async ev => {
      let update = {};

      update['system.-=modecreation'] = null;
      update['system.-=rolledCaracteristiques'] = null;
      update['system.-=modecreation-chance'] = null;

      this.actor.update(update);
    });

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

    html.find(`div.inventaire div.armure i.btnequip`).click(ev => {
      ev.preventDefault();
      const header = $(ev.currentTarget).parents(".summary");
      const item = this.actor.items.get(header.data("item-id"));
      const isEquipped = item.system?.equip ?? false;
      const newValue = isEquipped ? false : true;

      item.update({['system.equip']:newValue});
      activeOrUnactiveEffect(item, isEquipped);
    });

    html.find('div.voies div.listvoie div.rang').click(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const id = header.data('id');
      const rang = target.data('rang');
      const profil = this.profil;
      const getIndexVoie = Object.values(profil.system.voie).findIndex(itm => itm._id === id);
      const getVoie = profil.system.voie[getIndexVoie];
      const getRang = getVoie.system.listrang[rang];
      const value = getRang?.selected ?? false;
      const newValue = value ? false : true;

      profil.update({[`system.voie.${getIndexVoie}.system.listrang.${rang}.selected`]:newValue});
      activeOrUnactiveEffect(profil, value, getVoie._id, rang);
    });

    html.find('div.modecreation-listvoie div.rang').click(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const id = header.data('id');
      const rang = target.data('rang');
      const profil = this.profil;
      const getIndexVoie = Object.values(profil.system.voie).findIndex(itm => itm._id === id);
      const getVoie = profil.system.voie[getIndexVoie];
      const getRang = getVoie.system.listrang[rang];
      const value = getRang?.selected ?? false;
      const newValue = value ? false : true;

      profil.update({[`system.voie.${getIndexVoie}.system.listrang.${rang}.selected`]:newValue});
    });

    html.find('div.niveau i.up').click(ev => {
      const system = this.actor.system;
      const profil = this.profil;
      const niveau = parseInt(system.niveau.actuel);
      const newNiveau = niveau+1;
      let atkContact = parseInt(system.combat.contact.niveau);
      let atkDistance = parseInt(system.combat.distance.niveau);
      let atkMagique = parseInt(system.combat.magique.niveau);
      let html = ``;

      if(profil === undefined) {
        ui.notifications.error(game.i18n.localize(`CNK.NIVEAU.AucunProfil`));
        return;
      }

      if((atkContact < 6 || atkDistance < 6 || atkMagique < 6) && newNiveau%2 === 0) {
        html +=
        `<label>
          <span>${game.i18n.localize(`CNK.NIVEAU.BonusAttaque`)} ?</span>
          <select class="atk">`;
        html += `<option value="">${game.i18n.localize(`CNK.Choisir`)}</option>`;
        if(atkContact < 6) html += `<option value="contact">${game.i18n.localize(`CNK.COMBAT.Contact`)}</option>`;
        if(atkDistance < 6) html += `<option value="distance">${game.i18n.localize(`CNK.COMBAT.Distance`)}</option>`;
        if(atkMagique < 6) html += `<option value="magique">${game.i18n.localize(`CNK.COMBAT.Magique`)}</option>`;
        html += `</select> </label>`;
      }

    let d = new Dialog({
        title: game.i18n.localize(`CNK.NIVEAU.Up`),
        content: html,
        buttons: {
         one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`CNK.Valider`),
          callback: async (dataHtml) => {
            const pv = system.derives.pv;
            const dataProfil = profil.system;
            const dv = parseInt(dataProfil.dv);
            const con = parseInt(system.caracteristiques.constitution.modificateur);
            const pvMax = parseInt(pv.max);
            const rMode = game.settings.get("core", "rollMode");
            const whatAtk = dataHtml.find('select.atk').val();
            let newDv = parseInt(pv.dv);
            let newCon = parseInt(pv.con);
            let pData = {};
            let update = {};

            pData.label = game.i18n.localize("CNK.NIVEAU.Up");
            pData.oldLvl = niveau;
            pData.newLvl = newNiveau;
            pData.oldPv = pvMax;
            pData.newPv = pvMax;
            pData.oldCap = parseInt(system.capacites.max);
            pData.newCap = pData.oldCap+2;

            if(newNiveau > 10) {
              if(dv === 6 || dv === 8) pData.newPv += 1;
              else if(dv === 10) pData.newPv += 2;
            } else if(newNiveau%2 === 0) {
              const formula = `1D${dv}`;
              const rollDv = new Roll(formula);
              await rollDv.evaluate();
              const pRollDv = {
                flavor:game.i18n.localize(`CNK.NIVEAU.Dv`),
                tooltip:await rollDv.getTooltip(),
                result:rollDv.total,
              };
              const rollMsgDataDv = {
                user: game.user.id,
                speaker: {
                  actor: this.actor?.id || null,
                  token: this.actor?.token?.id || null,
                  alias: this.actor?.name || null,
                },
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                rolls:[rollDv],
                content: await renderTemplate('systems/cthulhu-no-kami/templates/roll/simple.html', pRollDv),
                sound: CONFIG.sounds.dice
              };
              const msgDataDv = ChatMessage.applyRollMode(rollMsgDataDv, rMode);

              await ChatMessage.create(msgDataDv, {
                rollMode:rMode
              });

              pData.newPv += con < 0 ? Math.max(parseInt(rollDv.total)+con, 0) : parseInt(rollDv.total);
              newDv += con < 0 ? Math.max(parseInt(rollDv.total)+con, 0) : parseInt(rollDv.total);
              pData.titlePv = con < 0 ? `1D10 (${rollDv.total} - ${Math.abs(con)})` : `1D10 (${rollDv.total})`;
            } else {
              pData.newPv += con < 0 ? 0 : con;;
              newCon += con < 0 ? 0 : con;
            }

            if(whatAtk !== "") {
              switch(whatAtk) {
                case 'contact':
                  pData.labelAtk = game.i18n.localize(`CNK.COMBAT.Contact`);
                  pData.oldAtk = atkContact;
                  pData.newAtk = atkContact+1;
                  break;

                case 'distance':
                  pData.labelAtk = game.i18n.localize(`CNK.COMBAT.Distance`);
                  pData.oldAtk = atkDistance;
                  pData.newAtk = atkDistance+1;
                  break;

                case 'magique':
                  pData.labelAtk = game.i18n.localize(`CNK.COMBAT.Magique`);
                  pData.oldAtk = atkMagique;
                  pData.newAtk = atkMagique+1;
                  break;
              }

              update[`system.niveau.${whatAtk}`] = pData.newAtk;
            }

            const sendMsgData = {
              user: game.user.id,
              speaker: {
                actor: this.actor?.id || null,
                token: this.actor?.token?.id || null,
                alias: this.actor?.name || null,
              },
              type: CONST.CHAT_MESSAGE_TYPES.OTHER,
              content: await renderTemplate('systems/cthulhu-no-kami/templates/chat/sendlvl.html', pData)
            };
            const msgData = ChatMessage.applyRollMode(sendMsgData, rMode);

            await ChatMessage.create(msgData, {
              rollMode:rMode
            });

            update[`system.niveau.actuel`] = newNiveau;
            update[`system.derives.pv.dv`] = newDv;
            update[`system.derives.pv.con`] = newCon;
            update[`system.historique.${niveau}`] = {
              dv:pv.dv,
              con:pv.con,
              contact:atkContact,
              distance:atkDistance,
              magique:atkMagique,
            };

            this.actor.update(update);
          }
         },
         two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`CNK.Annuler`)
         }
        },
        default: "two",
      },{
      classes:['dialoglvl']
      });
      d.render(true);
    });

    html.find('div.niveau i.down').click(async ev => {
      const system = this.actor.system;
      const niveau = parseInt(system.niveau.actuel);
      const historique = system.historique[niveau-1];
      const pvMod = parseInt(system.derives.pv.mod);
      const pvTemp = parseInt(system.derives.pv.temp);
      const pvBase = parseInt(system.derives.pv.base);
      const atkContact = parseInt(system.niveau.contact);
      const atkDistance = parseInt(system.niveau.distance);
      const atkMagique = parseInt(system.niveau.magique);
      const hDv = parseInt(historique.dv);
      const hCon = parseInt(historique.con);
      const hContact = parseInt(historique.contact);
      const hDistance = parseInt(historique.distance);
      const hMagique = parseInt(historique.magique);
      const rMode = game.settings.get("core", "rollMode");

      let d = new Dialog({
        title: game.i18n.localize(`CNK.NIVEAU.Down`),
        content: "",
        buttons: {
         one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`CNK.Valider`),
          callback: async () => {
          let update = {};
          let pData = {};
          update[`system.niveau.actuel`] = niveau-1;
          update[`system.derives.pv.dv`] = hDv;
          update[`system.derives.pv.con`] = hCon;
          update[`system.niveau.contact`] = hContact;
          update[`system.niveau.distance`] = hDistance;
          update[`system.niveau.magique`] = hMagique;
          update[`system.historique.-=${niveau}`] = null;

          pData.label = game.i18n.localize("CNK.NIVEAU.Down");
          pData.oldLvl = niveau;
          pData.newLvl = niveau-1;

          if(hContact !== atkContact) {
            pData.labelAtk = game.i18n.localize(`CNK.COMBAT.Contact`);
            pData.oldAtk = atkContact;
            pData.newAtk = hContact;
          } else if(hDistance !== atkDistance) {
            pData.labelAtk = game.i18n.localize(`CNK.COMBAT.Distance`);
            pData.oldAtk = atkDistance;
            pData.newAtk = hDistance;
          } else if(hMagique !== atkMagique) {
            pData.labelAtk = game.i18n.localize(`CNK.COMBAT.Magique`);
            pData.oldAtk = atkMagique;
            pData.newAtk = hMagique;
          }

          pData.oldPv = pvBase+pvMod+pvTemp;
          pData.newPv = hDv+hCon+pvMod+pvTemp;

          const sendMsgData = {
            user: game.user.id,
            speaker: {
              actor: this.actor?.id || null,
              token: this.actor?.token?.id || null,
              alias: this.actor?.name || null,
            },
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: await renderTemplate('systems/cthulhu-no-kami/templates/chat/sendlvl.html', pData)
          };
          const msgData = ChatMessage.applyRollMode(sendMsgData, rMode);

          await ChatMessage.create(msgData, {
            rollMode:rMode
          });

          this.actor.update(update);
          }
         },
         two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`CNK.Annuler`)
         }
        },
        default: "two",
      },{
      classes:['dialoglvl']
      });
      d.render(true);
    });

    html.find('.roll').click(async ev => {
      const target = $(ev.currentTarget);
      const main = target.data('main');
      const type = target.data('type');
      const title = target.data('title');
      const rMentale = target?.data('rtype') ?? false;
      const system = this.actor.system;
      const diceUsed = system?.roll?.modDice ?? 20;
      const dataRoll = system[main][type];
      let base = dataRoll.modificateur;
      let rollWButtons = "";

      if(rMentale) rollWButtons = "resistancementale";

      if(dataRoll.modificateur === undefined && dataRoll.total !== undefined) base = dataRoll.total;
      else if(dataRoll.modificateur === undefined && dataRoll.total === undefined) base = dataRoll.actuel;

      const bRoll = dataRoll?.bonusRoll ?? [];
      const bRollC = dataRoll?.bonusRollCondition ?? [];
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
      const actor = this.actor;
      const wpn = header.data("item-id");
      const tgt = game.user.targets;
      const iterator = tgt.values()
      const token = iterator?.next()?.value?.document ?? undefined;
      const system = actor.system;
      const dataRoll = system[main][type];
      const base = wpntype === 'sortilege' ? dataRoll.modificateur : dataRoll.total;
      const bRoll = dataRoll?.bonusRoll ?? [];
      const bRollC = dataRoll?.bonusRollCondition ?? [];
      const bRoll2 = wpntype === 'sortilege' ? system.combat.magique?.bonusRoll ?? [] : [];
      const bRoll2C = wpntype === 'sortilege' ? system.combat.magique?.bonusRollCondition ?? []  : [];
      let diceUsed = system?.roll?.modDice ?? 20;
      diceUsed = getNumberWpnEquipped(actor) > 1 ? 12 : diceUsed;

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

    html.find('i.equip').click(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const id = header.data("item-id");
      const actor = this.actor;
      const itm = actor.items.get(id);
      const type = target.data('equip');
      const equipped = itm.system?.equipped ?? "";
      const wpnEquipped = this.hasWpnEquipped;
      const listWpnEquipped = this.listWpnEquipped;

      if(equipped === type) itm.update({['system.equipped']:""});
      else if((type === '1main' && wpnEquipped < 2) || (type === '2mains' && wpnEquipped < 1) || (this.listWpnUsed.includes(id) && listWpnEquipped < 2)) itm.update({['system.equipped']:type});
      else ui.notifications.error(game.i18n.localize(`CNK.UTILISATIONS.AucuneMain`));
    });

    html.find('i.use').click(ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const id = header.data("item-id");
      const actor = this.actor;
      const itm = actor.items.get(id);
      const equipped = itm.system?.used ?? false;
      const result = equipped ? false : true;

      itm.update({['system.used']:result});
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
    const classList = event.target.classList;
    if ( classList.contains("content-link") ) return;

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

    if(classList.contains("rolledCaracteristiques-drag")) {
      dragData = {
        type:'rolledCaracteristiques',
        value:$(li).data('value'),
      }
    }

    if ( !dragData ) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  /** @inheritdoc */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    if ( allowed === false ) return;

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
      case "rolledCaracteristiques":
        const drop = $(event.target).parents('.rolledCaracteristiques-drop');
        const type = drop.data('type');
        const value = data.value;

        if(type !== undefined) {
          const rolled = this.actor.system.rolledCaracteristiques;
          const index = rolled.indexOf(value);
          if (index !== -1) rolled.splice(index, 1);

          let update = {};
          update[`system.caracteristiques.${type}.score`] = data.value;
          update[`system.rolledCaracteristiques`] = rolled;

          this.actor.update(update);
        }
        break;
    }
  }

  async _onDropItemCreate(itemData) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    const actorData = this.actor;
    const data = itemData[0];
    const itemBaseType = data.type;

    if(itemBaseType === 'profil') {
      const profil = actorData.items.find(items => items.type === 'profil');

      if(profil !== undefined) await profil.delete();
    }

    if(itemBaseType === 'voie') {
      const profil = actorData.items.find(items => items.type === 'profil');

      if(profil === undefined) return;

      const voie = profil.system.voie;
      const id = foundry.utils.randomID();
      let length = Object.keys(voie).length;
      let update = {};
      let addEffect = [];

      update[`system.voie.${length}`] = data;
      update[`system.voie.${length}._id`] = id;
      update[`system.voie.${length}.-=effects`] = null;
      update[`system.voie.${length}.system.type`] = "predilection";

      profil.update(update);

      for(let e of data.effects) {
        addEffect.push({
          name: `${id}_${e.name}`,
          icon:'',
          changes:e.changes,
          disabled:true
        });
      }

      profil.createEmbeddedDocuments('ActiveEffect', addEffect);
    } else {
      const itemCreate = await this.actor.createEmbeddedDocuments("Item", itemData);

      return itemCreate;
    }
  }

  async _prepareCharacterItems(actorData) {
    const items = actorData.items;
    const ki = this.ki;
    let profil = undefined;
    let avantage = [];
    let desavantage = [];
    let folie = [];
    let phobie = [];
    let wpnall = [];
    let wpncontact = [];
    let wpndistance = [];
    let wpngrenade = [];
    let wpnartillerie = [];
    let wpnequipped = [];
    let sortilege = [];
    let armure = [];
    let objet = [];
    let voie = [];
    let used = false;

    for (let i of items) {
      const type = i.type;
      const data = i.system;

      switch(type) {
        case "profil":
          profil = i;
          break;

        case "avantage":
          avantage.push(i);
          break;

        case "desavantage":
          desavantage.push(i);
          break;

        case "folie":
          folie.push(i);
          break;

        case "phobie":
          phobie.push(i);
          break;

        case "wpncontact":
        case "wpndistance":
        case "wpngrenade":
        case "wpnartillerie":
          const equipped = data?.equipped ?? "";
          used = data?.used ?? false;
          if(equipped === "" && !used) wpnall.push(i);

          if(type === 'wpncontact' && equipped === "" && !used) wpncontact.push(i);
          else if(type === 'wpndistance' && equipped === "" && !used) wpndistance.push(i);
          else if(type === 'wpngrenade' && equipped === "" && !used) wpngrenade.push(i);
          else if(type === 'wpnartillerie' && equipped === "" && !used) wpnartillerie.push(i);
          else if(equipped !== "" || used) wpnequipped.push(i);
          break;

        case "sortilege":
          used = data?.used ?? false;
          const rang = parseInt(i.system.rang)

          i.system.difficulte = {
            forme:rang*5,
            canalisation:parseInt(i.system.attaque)+(rang*5)
          }

          if(used) {
            wpnequipped.push(i);
          } else {
            wpnall.push(i);
            sortilege.push(i);
          }
          break;

        case "armure":
          armure.push(i);
          break;

        case "objet":
          objet.push(i);
          break;
      }
    };

    if(profil !== undefined) {
      const voies = profil?.system?.voie ?? {};

      for(let v in voies) {
        const rangs = voies[v].system.listrang;
        for(let r in rangs) {
          const d = rangs[r];

          if(d.selected) voie.push(Object.assign({rang:parseInt(r.replace('rang','')), strrang:r}, d));
        }
      }
    }

    voie.sort((a, b) => {
      if(a.rang > b.rang) return 1;
      else return -1;
    });

    actorData.actor.profil = profil;
    actorData.actor.avantages = avantage;
    actorData.actor.desavantages = desavantage;
    actorData.actor.folies = folie;
    actorData.actor.phobies = phobie;
    actorData.actor.wpnall = wpnall;
    actorData.actor.wpncontact = wpncontact;
    actorData.actor.wpndistance = wpndistance;
    actorData.actor.wpngrenade = wpngrenade;
    actorData.actor.wpnartillerie = wpnartillerie;
    actorData.actor.wpnequipped = wpnequipped;
    actorData.actor.sortilege = sortilege;
    actorData.actor.armures = armure;
    actorData.actor.objets = objet;
    actorData.actor.voies = profil?.system?.voie ?? [];
    actorData.actor.capacites = voie;
  }

  _calculPC(actorData) {
    const data = actorData.data.system;
    const avantages = this.actor.items.filter(itm => itm.type === 'avantage');
    const desavantages = this.actor.items.filter(itm => itm.type === 'desavantage');
    const alreadyAdd = data.derives.chance.mod;
    let total = 0;

    for(let key of avantages) {
      total -= key.system.cout;
    }

    for(let key of desavantages) {
      total -= key.system.cout;
    }

    if(alreadyAdd !== total) {
      this.actor.update({['system.derives.chance.mod']:total});
    }
  }

  _prepareDefense(actorData) {
    const data = actorData.data.system;
    data.combat.defense.list = CONFIG.CNK.DefensePossible;
  }

  _listCaracs(actorData) {
    const data = actorData.systemData;
    data.listCarac = CONFIG.CNK.CarPossible;
  }
}