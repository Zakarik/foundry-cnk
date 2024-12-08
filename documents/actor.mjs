import { setBaseImg } from "../module/helpers/common.mjs";

/**
 * Extend the base Actor document to support attributes and groups with a custom template creation dialog.
 * @extends {Actor}
 */
export class CNKActor extends Actor {

  /**
     * Create a new entity using provided input data
     * @override
     */
  static async create(data, options = {}) {
    // Replace default image
    if (data.img === undefined) data.img = setBaseImg(data.type);

    await super.create(data, options);
  }

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  prepareDerivedData() {
    const actorData = this;

    this._prepareCNKData(actorData);
    this._prepareEntiteData(actorData);
    this._prepareVehiculeData(actorData);
  }

  _prepareCNKData(actorData) {
    if (actorData.type !== 'eiyu') return;

    const system = actorData.system;
    const niveau = parseInt(system.niveau.actuel);
    const carac = system.caracteristiques;
    const derives = system.derives;
    const combat = system.combat;
    const profil = actorData.items.find(items => items.type === 'profil');
    const armure = actorData.items.filter(items => items.type === 'armure');
    const listWpn = ['wpncontact', 'wpndistance', 'wpnartillerie', 'wpngrenade'];
    const wpn = actorData.items.filter(items => listWpn.includes(items.type));
    const traits = actorData.items.filter(items => items.type === 'trait');
    const voies = profil?.system?.voie ?? {};
    let wpnequipped = "";
    let listWpnEquipped = [];
    let totalArmure = 0;
    let totalReduction = 0;
    let ptscapacites = 0;
    let ptscapacitesMax = profil === undefined ? 0 : 2+(system.niveau.actuel*2)+profil?.system?.capacite ?? 0;
    let bonusRoll = {
      force:[],
      dexterite:[],
      constitution:[],
      perception:[],
      intelligence:[],
      sagesse:[],
      charisme:[],
      contact:[],
      distance:[],
      magique:[],
      volonte:[],
    };
    let bonusRollCondition = {
      force:[],
      dexterite:[],
      constitution:[],
      perception:[],
      intelligence:[],
      sagesse:[],
      charisme:[],
      contact:[],
      distance:[],
      magique:[],
      volonte:[],
    };

    for (let armureItem of armure) {
      let isEquip = armureItem?.system?.equip ?? false;

      totalArmure += isEquip ? parseInt(armureItem?.system?.defense ?? 0) : 0;
      totalReduction += isEquip ? parseInt(armureItem?.system?.reduction ?? 0) : 0;
    }

    for (let key in carac) {
      let total = 0;
      let bonusMod = 0;
      total += parseInt(carac[key].score ?? 0);
      total += parseInt(carac[key].divers ?? 0);
      total += parseInt(carac[key].temp ?? 0);
      total += parseInt(carac[key].other ?? 0);
      bonusMod += parseInt(carac[key].modOther ?? 0);

      carac[key].total = total;
      carac[key].modificateur = Math.floor((total-10)/2)+bonusMod;
    }

    if(niveau === 1) {
      derives.pv.dv = parseInt(profil?.system?.dv ?? 0);
      derives.pv.con = parseInt(carac.constitution.modificateur);
    }

    for(let key in derives) {
      const notAutoCalc = ['folie', 'blessures', 'ki'];
      const d = derives[key];
      const config = CONFIG.CNK.Derives[key];

      d.template =  config.templates;
      d.template.key = key;
      d.template.label = game.i18n.localize(CONFIG.CNK.Derives[key].label);

      this._setBaseData(key, actorData, profil);

      if(!notAutoCalc.includes(key)) {
        const calc = Math.max(parseInt(d.base)+parseInt(d.temp)+parseInt(d.mod), 0);

        if(config.templates.isDouble) {
          d.max = calc;

          if(d.value > calc && key !== 'volonte') d.value = calc;
        } else if(key !== 'volonte') d.value = calc;
        else d.actuel = calc;
      }
    }


    for(let key in combat) {
      const c = combat[key];
      let total = 0;
      let totalContact = 0;
      let divers = c?.other ?? 0;

      switch(key) {
        case 'initiative':
          c.car = parseInt(carac[c.carac].modificateur);
          c.armure = 0-parseInt(totalArmure);

          total += parseInt(c.car);
          total += parseInt(c.armure);
          break;

        case 'contact':
          c.profil = profil ? profil.system.attaque.contact : 0;
          c.car = parseInt(carac[c.carac].modificateur);
          c.niveau = parseInt(system.niveau.contact);

          total += parseInt(c.profil);
          total += parseInt(c.car);
          total += parseInt(c.niveau);
          break;

        case 'distance':
          c.profil = profil ? profil.system.attaque.distance : 0;
          c.car = parseInt(carac[c.carac].modificateur);
          c.niveau = parseInt(system.niveau.distance);

          total += parseInt(c.profil);
          total += parseInt(c.car);
          total += parseInt(c.niveau);
          break;

        case 'magique':
          c.car = parseInt(carac[c.carac].modificateur);
          c.niveau = parseInt(system.niveau.distance);

          total += parseInt(c.car);
          total += parseInt(c.niveau);
          break;

        case 'defense':
          let actDef = 0;
          if(c.type === 'simple') actDef += 2;
          else if(c.type === 'totale') actDef += 4;

          c.car = parseInt(carac[c.carac].modificateur);
          c.armure = parseInt(totalArmure);
          c.actionDef = parseInt(actDef);

          total += 10;
          total += parseInt(c.car);
          total += parseInt(c.armure);
          totalContact += parseInt(c.actionDef);
          break;

        case 'reduction':
          c.armure = parseInt(totalReduction);

          total += parseInt(c.armure);
          break;
      }

      c.divers = divers;

      if(key !== 'reduction') {
        c.etat = c?.etat ?? 0;
        total += parseInt(c.etat);
      }

      total += parseInt(c.divers);
      total += parseInt(c.mod);
      total += parseInt(c.temp);

      c.total = total;
      if(key === 'defense') c.totalContact = total+totalContact;
    }


    for(let v in voies) {
      const voie = voies[v];
      const listrang = voie.system.listrang;

      for(let r in listrang) {
        const rang = listrang[r];
        const isSelected = rang?.selected ?? false;
        const modjet = rang?.modjet?.list ?? {};
        let vRang = parseInt(r.replace('rang', ''));

        if(isSelected) {
          switch(voie.system.type) {
            case 'predilection':
            case 'famille':
            case 'horsprofil':
              if(vRang <= 2) ptscapacites += 1;
              else ptscapacites += 2;
              break;

            case 'horsfamille':
            case 'prestige':
              ptscapacites += 2;
              break;
          }

          for(let j in modjet) {
            const dJ = modjet[j];
            const name = dJ.key;
            const value = dJ.value;
            const condition = dJ.condition;

            if(name !== "") {
              const listcar = CONFIG.CNK.ListCaracteristiques;

              if(listcar.includes(name)) {
                if(condition !== "") bonusRollCondition[name].push({
                  value:value,
                  name:condition
                })
                else {
                  bonusRoll[name].push({
                    name:rang.name === '' ? game.i18n.localize(`CNK.VOIE.${r.charAt(0).toUpperCase() + r.slice(1)}`) : rang.name,
                    value:value,
                    active:true
                  });
                }
              }
            }
          }
        }
      }
    }

    for(let t in traits) {
      const data = traits[t];
      const modjet = data.system?.modjet?.list ?? {};

      for(let j in modjet) {
        const dJ = modjet[j];
        const name = dJ.key;
        const value = dJ.value;
        const condition = dJ.condition;

        if(name !== "") {
          const listroll = [].concat(CONFIG.CNK.ListCaracteristiques, CONFIG.CNK.ListCombatWithRoll, CONFIG.CNK.ListDerivesWithRoll);

          if(listroll.includes(name)) {
            if(condition !== "") bonusRollCondition[name].push({
              value:value,
              condition:condition
            })
            else {
              bonusRoll[name].push({
                name:data.name,
                value:value,
                active:true
              });
            }
          }
        }
      }
    }


    for(let key in carac) {
      carac[key].bonusRoll = bonusRoll[key];
      carac[key].bonusRollCondition = bonusRollCondition[key];
    }


    for(let key in combat) {
      combat[key].bonusRoll = bonusRoll[key];
      combat[key].bonusRollCondition = bonusRollCondition[key];
    }


    for(let key in derives) {
      derives[key].bonusRoll = bonusRoll[key];
      derives[key].bonusRollCondition = bonusRollCondition[key];
    }


    for(let w of wpn) {
      const equipped = w.system?.equipped ?? "";

      if(equipped !== '') listWpnEquipped.push(w._id);

      if(equipped === '1main' && wpnequipped === '') wpnequipped = '1main';
      else if((equipped === '2mains' && wpnequipped === '') || (equipped === '1main' && wpnequipped === '1main')) wpnequipped = '2mains';
    }


    system.capacites = {
      value:ptscapacites,
      max:ptscapacitesMax,
    };

    system.wpnequipped = wpnequipped;
    system.listwpnequipped = listWpnEquipped;
  };

  _prepareEntiteData(actorData) {
    if (actorData.type !== 'entite') return;

    const system = actorData.system;
    const carac = system.caracteristiques;
    const derives = system.derives;
    const combat = system.combat;
    const profil = actorData.items.find(items => items.type === 'profil');
    const armure = actorData.items.filter(items => items.type === 'armure');
    const listWpn = ['wpncontact', 'wpndistance', 'wpnartillerie', 'wpngrenade'];
    const wpn = actorData.items.filter(items => listWpn.includes(items.type));
    const traits = actorData.items.filter(items => items.type === 'capacite');
    let wpnequipped = "";
    let listWpnEquipped = [];
    let totalArmure = 0;
    let totalReduction = 0;
    let bonusRoll = {
      force:[],
      dexterite:[],
      constitution:[],
      perception:[],
      intelligence:[],
      sagesse:[],
      charisme:[],
      contact:[],
      distance:[],
      magique:[],
      volonte:[],
    };
    let bonusRollCondition = {
      force:[],
      dexterite:[],
      constitution:[],
      perception:[],
      intelligence:[],
      sagesse:[],
      charisme:[],
      contact:[],
      distance:[],
      magique:[],
      volonte:[],
    };

    for (let armureItem of armure) {
      let isEquip = armureItem?.system?.equip ?? false;

      totalArmure += isEquip ? parseInt(armureItem?.system?.defense ?? 0) : 0;
      totalReduction += isEquip ? parseInt(armureItem?.system?.reduction ?? 0) : 0;
    }

    for (let key in carac) {
      let total = 0;
      let bonusMod = 0;
      total += parseInt(carac[key].score ?? 0);
      total += parseInt(carac[key].divers ?? 0);
      total += parseInt(carac[key].temp ?? 0);
      total += parseInt(carac[key].other ?? 0);
      bonusMod += parseInt(carac[key].modOther ?? 0);

      carac[key].total = total;
      carac[key].modificateur = Math.floor((total-10)/2)+bonusMod;
    }

    for(let key in derives) {
      const notAutoCalc = ['folie', 'blessures', 'ki', 'pv'];
      const d = derives[key];
      const config = CONFIG.CNK.Derives[key];

      d.template =  config.templates;
      d.template.key = key;
      d.template.label = game.i18n.localize(CONFIG.CNK.Derives[key].label);

      this._setBaseData(key, actorData, profil);

      if(!notAutoCalc.includes(key)) {
        const calc = Math.max(parseInt(d.base)+parseInt(d.temp)+parseInt(d.mod), 0);

        if(config.templates.isDouble) {
          d.max = calc;

          if(d.value > calc && key !== 'volonte') d.value = calc;
        } else if(key !== 'volonte') d.value = calc;
        else d.actuel = calc;
      }
    }


    for(let key in combat) {
      const c = combat[key];
      let total = 0;
      let totalContact = 0;
      let divers = c?.other ?? 0;

      switch(key) {
        case 'initiative':
          c.car = parseInt(carac[c.carac].modificateur);
          c.armure = 0-parseInt(totalArmure);

          total += parseInt(c.car);
          total += parseInt(c.armure);
          break;

        case 'contact':
          c.profil = profil ? profil.system.attaque.contact : 0;
          c.car = parseInt(carac[c.carac].modificateur);
          c.niveau = parseInt(system.niveau.contact);

          total += parseInt(c.profil);
          total += parseInt(c.car);
          total += parseInt(c.niveau);
          break;

        case 'distance':
          c.profil = profil ? profil.system.attaque.distance : 0;
          c.car = parseInt(carac[c.carac].modificateur);
          c.niveau = parseInt(system.niveau.distance);

          total += parseInt(c.profil);
          total += parseInt(c.car);
          total += parseInt(c.niveau);
          break;

        case 'magique':
          c.car = parseInt(carac[c.carac].modificateur);
          c.niveau = parseInt(system.niveau.distance);

          total += parseInt(c.car);
          total += parseInt(c.niveau);
          break;

        case 'defense':
          let actDef = 0;
          if(c.type === 'simple') actDef += 2;
          else if(c.type === 'totale') actDef += 4;

          c.car = parseInt(carac[c.carac].modificateur);
          c.armure = parseInt(totalArmure);
          c.actionDef = parseInt(actDef);

          total += 10;
          total += parseInt(c.car);
          total += parseInt(c.armure);
          totalContact += parseInt(c.actionDef);
          break;

        case 'reduction':
          c.armure = parseInt(totalReduction);

          total += parseInt(c.armure);
          break;
      }

      c.divers = divers;

      if(key !== 'reduction') {
        c.etat = c?.etat ?? 0;
        total += parseInt(c.etat);
      }

      total += parseInt(c.divers);
      total += parseInt(c.mod);
      total += parseInt(c.temp);

      c.total = total;
      if(key === 'defense') c.totalContact = total+totalContact;
    }

    for(let t in traits) {
      const data = traits[t];
      const modjet = data.system?.modjet?.list ?? {};

      for(let j in modjet) {
        const dJ = modjet[j];
        const name = dJ.key;
        const value = dJ.value;
        const condition = dJ.condition;

        if(name !== "") {
          const listroll = [].concat(CONFIG.CNK.ListCaracteristiques, CONFIG.CNK.ListCombatWithRoll, CONFIG.CNK.ListDerivesWithRoll);

          if(listroll.includes(name)) {
            if(condition !== "") bonusRollCondition[name].push({
              value:value,
              condition:condition
            })
            else {
              bonusRoll[name].push({
                name:data.name,
                value:value,
                active:true
              });
            }
          }
        }
      }
    }


    for(let key in carac) {
      carac[key].bonusRoll = bonusRoll[key];
      carac[key].bonusRollCondition = bonusRollCondition[key];
    }


    for(let key in combat) {
      combat[key].bonusRoll = bonusRoll[key];
      combat[key].bonusRollCondition = bonusRollCondition[key];
    }


    for(let key in derives) {
      derives[key].bonusRoll = bonusRoll[key];
      derives[key].bonusRollCondition = bonusRollCondition[key];
    }


    for(let w of wpn) {
      const equipped = w.system?.equipped ?? "";

      if(equipped !== '') listWpnEquipped.push(w._id);

      if(equipped === '1main' && wpnequipped === '') wpnequipped = '1main';
      else if((equipped === '2mains' && wpnequipped === '') || (equipped === '1main' && wpnequipped === '1main')) wpnequipped = '2mains';
    }

    system.wpnequipped = wpnequipped;
    system.listwpnequipped = listWpnEquipped;
  };

  _prepareVehiculeData(actorData) {
    if (actorData.type !== 'vehicule') return;

    const system = actorData.system;
    const carac = system.caracteristiques;
    const derives = system.derives;
    const combat = system.combat;
    const passagers = system?.listpassagers ?? [];
    const pilote = system?.listpilote ?? [];
    const listWpn = ['wpncontact', 'wpndistance', 'wpnartillerie', 'wpngrenade'];
    const wpn = actorData.items.filter(items => listWpn.includes(items.type));
    let wpnequipped = "";
    let listWpnEquipped = [];
    let fPassagers = {};
    let fPilote = {};

    for(let i = 0;i < passagers.length;i++) {
      const actor = game.actors.get(passagers[i]);

      if(actor === undefined) passagers[i] = game.i18n.localize('CNK.VEHICULE.Inexistant');
      else {
        fPassagers[actor._id] = actor.name;
      }
    }

    for(let i = 0;i < pilote.length;i++) {
      const actor = game.actors.get(pilote[i]);

      if(actor === undefined) pilote[i] = game.i18n.localize('CNK.VEHICULE.Inexistant');
      else {
        fPilote[actor._id] = actor.name;
      }
    }

    system.passagers = fPassagers;
    system.pilote = fPilote;

    for (let key in carac) {
      let total = 0;
      total += parseInt(carac[key].score ?? 0);
      total += parseInt(carac[key].temp ?? 0);
      total += parseInt(carac[key].other ?? 0);

      carac[key].total = total;
    }

    for(let key in derives) {
      const d = derives[key];
      let total = 0;
      let used = 0;

      if(key === 'places') {
        d.base = parseInt(carac.force.total)+4;
        used = parseInt(passagers.length+pilote.length);
      }

      total += parseInt(d.base ?? 0);
      total += parseInt(d.temp ?? 0);

      d.max = total;

      if(key === 'places') {
        d.actuel = total-used;
      }
    }

    for(let key in combat) {
      let total = 0;

      total += parseInt(combat[key].base ?? 0);
      total += parseInt(combat[key].score ?? 0);
      total += parseInt(combat[key].temp ?? 0);
      total += parseInt(combat[key].other ?? 0);

      combat[key].total = total;
    }

    for(let w of wpn) {
      listWpnEquipped.push(w._id);

      wpnequipped = '1main';
      wpnequipped = '2mains';
    }

    system.wpnequipped = wpnequipped;
    system.listwpnequipped = listWpnEquipped;
  }

  _setBaseData(key, actor, p) {
    const n = parseInt(actor.system.niveau.actuel);
    const c = actor.system.caracteristiques;
    const d = actor.system.derives;
    let pSerenite = 0;
    let pChance = 0;
    let total = parseInt(d[key]?.other ?? 0);

    if(p) {
      pSerenite = parseInt(p.system.serenite);
      pChance = parseInt(p.system.chance);
    }


    switch(key) {
      case 'pv':
        total += parseInt(d.pv.dv)+parseInt(d.pv.con);
        break;

      case 'volonte':
        total += Math.floor((parseInt(c.perception.modificateur)+parseInt(c.intelligence.modificateur))/2);
        break;

      case 'serenite':
        total += pSerenite+parseInt(c.intelligence.modificateur)+parseInt(c.perception.modificateur)-parseInt(actor.system?.mythos ?? 0);
        break;

      case 'chance':
        total += pChance+parseInt(c.charisme.modificateur);
        break;

      case 'maho':
        total += n+parseInt(d.ki.actuel)+parseInt(c.constitution.modificateur);
        break;
    }

    d[key].base = total;
  };
}