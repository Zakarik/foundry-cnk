export function generateID() {
  return foundry.utils.randomID();
}

export function activeOrUnactiveEffect(item, value, idVoie='', rang=undefined) {
  const actor = item.actor;
  let effect = {};

  if(idVoie !== '' && rang !== undefined) effect = item.effects.find(itm => itm.name === `${idVoie}_${rang}`);
  else item.effects.contents[0]

  item.updateEmbeddedDocuments('ActiveEffect', [{
    "_id":effect._id,
    disabled:value,
  }]);

  if(actor !== null) {
    const effects = actor.effects.contents;
    let search = {};

    if(idVoie !== '' && rang !== undefined) search = effects.find(itm => itm.name === `${idVoie}_${rang}` && itm.origin === `Actor.${actor._id}.Item.${item._id}`);
    else search = effects.find(eff => eff.origin === `Actor.${actor._id}.Item.${item._id}`);

    actor.updateEmbeddedDocuments('ActiveEffect', [{
      "_id":search._id,
      disabled:value,
    }]);
  }
}

export function addHTMLMod(html, data, canBeDesactivate=false) {
  html.find(`i.addMod`).click(ev => {
      ev.preventDefault();
      const actor = data.actor;
      const state = data.system?.state ?? '0';

      if(state === '0') {
          data.createEmbeddedDocuments('ActiveEffect', [{
            name: data.type,
            icon:'',
            changes:[{
              key: ``,
              mode: 2,
              priority: null,
              value: 0
            }],
            disabled:canBeDesactivate
          }]);

        data.update({['system.state']:'1'});

        if(actor !== null) {
          actor.createEmbeddedDocuments('ActiveEffect', [{
            name: data.type,
            icon:'',
            origin:`Actor.${actor._id}.Item.${data._id}`,
            changes:[{
              key: ``,
              mode: 2,
              priority: null,
              value: 0
            }],
            disabled:canBeDesactivate
          }]);
        }
      } else {
        const effect = data.effects.contents[0];
        const changes = effect.changes;
        changes.push({
          key: ``,
          mode: 2,
          priority: null,
          value: 0
        });

        data.updateEmbeddedDocuments('ActiveEffect', [{
          "_id":effect._id,
          icon:'',
          changes:changes
        }]);

        if(actor !== null) {
          const effects = actor.effects.contents;
          const search = effects.find(eff => eff.origin === `Actor.${actor._id}.Item.${data._id}`);

          actor.updateEmbeddedDocuments('ActiveEffect', [{
            "_id":search._id,
            icon:'',
            changes:changes
          }]);
        }
      }
  });

  html.find(`i.deleteMod`).click(ev => {
  ev.preventDefault();
  const header = $(ev.currentTarget).parents(".effectsChanges");
  const key = header.data("key");
  const id = header.data("id");
  const actor = data.actor;
  const effect = data.effects.find(effects => effects._id === id);
  effect.changes.splice(key, 1);

  data.updateEmbeddedDocuments('ActiveEffect', [{
      "_id":id,
      icon:'',
      changes:effect.changes
  }]);

  if(actor !== null) {
      const effects = actor.effects.contents;
      const search = effects.find(eff => eff.origin === `Actor.${actor._id}.Item.${data._id}`);

      actor.updateEmbeddedDocuments('ActiveEffect', [{
      "_id":search._id,
      icon:'',
      changes:effect.changes
      }]);
  }
  });

  html.find(`button.btnEdit`).click(ev => {
  ev.preventDefault();
  let edit = data.system?.edit ?? false;
  let value = edit ? false : true;

  data.update({['system.edit']:value});
  });

  html.find(`button.saveMod`).click(ev => {
      ev.preventDefault();
      const actor = data.actor;
      const select = html.find(`div.modificateurBlock div.effectsBlock select`);
      const input = html.find(`div.modificateurBlock div.effectsBlock input`);
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
              data.updateEmbeddedDocuments('ActiveEffect', [{
              "_id":e._id,
              icon:'',
              changes:[]
          }]);
          }

          if(actor !== null) {
          const effects = actor.effects.contents;
          const search = effects.find(eff => eff.origin === `Actor.${actor._id}.Item.${data._id}`);

          actor.updateEmbeddedDocuments('ActiveEffect', [{
              "_id":search._id,
              icon:'',
              changes:[]
          }]);
          }
      } else {
          data.updateEmbeddedDocuments('ActiveEffect', [{
          "_id":id,
          icon:'',
          changes:finalChanges
          }]);

          if(actor !== null) {
          const effects = actor.effects.contents;
          const search = effects.find(eff => eff.origin === `Actor.${actor._id}.Item.${data._id}`);

          if(search === undefined) return;

          actor.updateEmbeddedDocuments('ActiveEffect', [{
              "_id":search._id,
              icon:'',
              changes:finalChanges
          }]);
          }
      }
  });
}

export function addHTMLModJet(html, item, data, path) {
  html.find(`i.addModJet`).click(ev => {
      ev.preventDefault();
      const listModJet = data?.modjet?.list ?? {};
      const length = Object.values(listModJet).length;
      let update = {};
      update[`${path}.list.${length}`] = {
        _id:generateID(),
        key:"",
        value:0,
        condition:"",
        path:path,
      };

      item.update(update);
  });

  html.find(`i.deleteModJet`).click(ev => {
    ev.preventDefault();
    const target = $(ev.currentTarget);
    const id = target.data('id');
    const listModJet = data.modjet.list;
    const toArray = Object.keys(listModJet);
    const mods = [];
    let update = {};
    let i = 0;

    for(let d in toArray) {
      const key = toArray[d];
      const data = listModJet[key];
      if(data._id === id) continue;

      mods.push(data);
      update[`${path}.list.${i}`] = data;
      i++;
    }

    update[`${path}.list.-=${toArray.length-1}`] = null;

    item.update(update);
  });

  html.find(`button.btnEditJet`).click(ev => {
    ev.preventDefault();
    let edit = data?.modjet?.edit ?? false;
    let value = edit ? false : true;

    item.update({[`${path}.edit`]:value});
  });

  html.find(`button.btnSelonRang`).click(ev => {
    ev.preventDefault();
    const target = $(ev.currentTarget);
    const id = target.data('id');
    const liste = data?.modjet?.list;
    const find = Object.values(liste).findIndex(itm => itm._id === id);
    let oldValue = data.modjet.list[find]?.selonrang ?? false;
    let value = oldValue ? false : true;

    item.update({[`${path}.list.${find}.selonrang`]:value});
  });
}

export function prepareMod(where) {
    let modToChoose = CONFIG.CNK.ModPossible;

    where.listMod = modToChoose;
}

export function prepareModJet(where) {
    let modToChoose = CONFIG.CNK.ModJetPossible;

    where.listModJet = modToChoose;
}

export function setBaseImg(type) {
  let img = "icons/svg/item-bag.svg";

  switch(type) {
    case "profil":
        img = "systems/cthulhu-no-kami/assets/icons/profil.svg";
        break;

    case "avantage":
        img = "systems/cthulhu-no-kami/assets/icons/trait.svg";
        break;

    case "desavantage":
        img = "systems/cthulhu-no-kami/assets/icons/desavantage.svg";
        break;

    case "phobie":
        img = "systems/cthulhu-no-kami/assets/icons/phobie.svg";
        break;

    case "folie":
        img = "systems/cthulhu-no-kami/assets/icons/folie.svg";
        break;

    case "wpncontact":
        img = "systems/cthulhu-no-kami/assets/icons/wpncontact.svg";
        break;

    case "wpndistance":
        img = "systems/cthulhu-no-kami/assets/icons/wpndistance.svg";
        break;

    case "wpngrenade":
        img = "systems/cthulhu-no-kami/assets/icons/wpngrenade.svg";
        break;

    case "wpnartillerie":
        img = "systems/cthulhu-no-kami/assets/icons/wpnartillerie.svg";
        break;

    case "sortilege":
        img = "systems/cthulhu-no-kami/assets/icons/sortilege.svg";
        break;

    case "armure":
        img = "systems/cthulhu-no-kami/assets/icons/armure.svg";
        break;

    case "voie":
        img = "systems/cthulhu-no-kami/assets/icons/voie.svg";
        break;

    case "vehicule":
        img = "systems/cthulhu-no-kami/assets/icons/vehicule.svg";
        break;

    case "eiyu":
        img = "icons/svg/mystery-man.svg";
      break;

    case "entite":
        img = "systems/cthulhu-no-kami/assets/icons/entite.svg";
      break;

    case "capacite":
        img = "systems/cthulhu-no-kami/assets/icons/capacite.svg";
      break;
  }

  return img;
}

export function setValueByPath(obj, path, value) {
  var a = path.split('.')
  var o = obj
  while (a.length - 1) {
    var n = a.shift()
    if (!(n in o)) o[n] = {}
    o = o[n]
  }
  o[a[0]] = value
}

export function getValueByPath(obj, path) {
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  var a = path.split('.')
  var o = obj
  while (a.length) {
    var n = a.shift()
    if (!(n in o)) return
    o = o[n]
  }
  return o
}

export async function sendChat(actor, title, msg) {
  const rMode = game.settings.get("core", "rollMode");
  const pData = {
    title:title,
    msg:msg,
  }

  const sendMsgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    content: await renderTemplate('systems/cthulhu-no-kami/templates/chat/sendmsg.html', pData)
  };
  const msgData = ChatMessage.applyRollMode(sendMsgData, rMode);

  await ChatMessage.create(msgData, {
    rollMode:rMode
  });
}

export async function doRoll(actor, data={}) {
  const rMode = game.settings.get("core", "rollMode");
  const tgt = data?.tgt ?? undefined;
  const wpn = data?.wpn ?? undefined;
  const specialType = data?.specialType ?? false;
  const epicFail = data?.epicFail ?? false;
  const cible = parseInt(data?.cible ?? '10');
  const acouvert = data?.acouvert ?? false;
  const rollWButtons = data?.rollWButtons ?? "";
  const dataWpn = wpn !== undefined ? actor.items.get(wpn) : undefined;
  const type = dataWpn === undefined ? "" : dataWpn.type;
  const roll = new Roll(`${data.formula}`);
  let rollData = data.pRoll;
  await roll.evaluate();

  const total = roll.dice[0].total;
  const totalRoll = roll.total;
  const noSpecial = data?.noSpecial ?? false;
  const margeCritique = dataWpn !== undefined && (dataWpn.type === 'wpncontact' || dataWpn.type === 'wpndistance') ? dataWpn?.system?.critique ?? 20 : 20;
  let echecCritique = data?.echecCritique ?? [4];
  let defense = 0;
  let rang = 0;
  let hit = false;
  let critique = false;
  let incident = false;
  let explode = false;
  let diceRolled = [];

  if(type === 'wpnartillerie') echecCritique.push(1, 2);
  if(type === 'sortilege' && !specialType) {
    rollData.subtitle = `<span>${game.i18n.localize('CNK.TABSCOMBAT.SORTILEGE.Forme')}</span>`;

    if(dataWpn !== undefined) {
      const carac = dataWpn.system?.caracteristique ?? "";

      if(carac !== "") rollData.subtitle += `<span>${game.i18n.localize(CONFIG.CNK.CarPossible[carac])}</span>`
    }
  } ;
  if(type === 'sortilege' && specialType) rollData.subtitle = game.i18n.localize('CNK.COMBAT.Magique');

  if(total >= margeCritique) critique = true;

  if(!echecCritique.includes(total) && type === 'wpngrenade') {
    defense = cible;

    if(cible === 10) {
      rollData.listBonus.push(`${game.i18n.localize(`CNK.ROLL.Cible`)} : ${game.i18n.localize(`CNK.ROLL.Cible10`)}`);
    } else if(cible === 15) {
      rollData.listBonus.push(`${game.i18n.localize(`CNK.ROLL.Cible`)} : ${game.i18n.localize(`CNK.ROLL.Cible15`)}`);
    }

    if(acouvert) {
      defense += 5;
      rollData.listBonus.push(game.i18n.localize(`CNK.ROLL.ACouvert`));
    }

    if(totalRoll >= defense+10 && defense !== 0) critique = true;

    if(totalRoll >= defense || critique) {
      rollData.hit = `<p class='green'>${game.i18n.localize(`CNK.ROLL.Hit`)}</p>`;
      hit = true;
    } else rollData.hit = `<p class='red'>${game.i18n.localize(`CNK.ROLL.Fail`)}</p>`;

  } else if(!echecCritique.includes(total) && type === 'sortilege') {
    const baseAtk = dataWpn.system?.attaque ?? 0;
    rang = parseInt(dataWpn.system.rang);
    defense = rang*5;

    if(specialType) defense += baseAtk;
    if(totalRoll >= defense+10) critique = true;

    if(totalRoll >= defense || critique) {
      rollData.hit = `<p class='green'>${game.i18n.localize(`CNK.ROLL.Success`)}</p>`;
      hit = true;
      if(specialType) rollData.text = dataWpn.system.description;
    } else {
      rollData.hit = `<p class='red'>${game.i18n.localize(`CNK.ROLL.Fail`)}</p>`;

      if(specialType && epicFail) rollData.special4 = `<p class='red'>${game.i18n.localize(`CNK.ROLL.EffetCatastrophique`)}</p>`;
    }

  } else if(!echecCritique.includes(total) && tgt !== undefined) {
    const actorTgt = getActorBySpeaker({token:tgt._id, scene:tgt.parent._id, actor:tgt.actorId});
    const actorType = actorTgt.type;
    let defense = parseInt(actorTgt.system.combat.defense.total);

    if(type === 'wpncontact') defense += parseInt(actorTgt.system.combat.defense.actionDef);

    if(actorType === 'vehicule') {
      const pilote = actorTgt.system.listpilote;
      if(pilote.length > 0) {
        const getPilote = game.actors.get(pilote[0]);

        if(getPilote !== undefined) {
          let vDefenseScore = actorTgt.system?.combat?.defense?.score ?? 0;
          let vDefenseTemp = actorTgt.system?.combat?.defense?.temp ?? 0;
          let vDefenseDex = getPilote.system?.caracteristiques?.dexterite?.modificateur ?? 0;

          defense = vDefenseDex+vDefenseScore+vDefenseTemp;
        }
      }
    }

    rollData.tgt = {
      tgt:tgt._id,
      scene:tgt.parent._id,
      actor:tgt.actorId,
    };
    rollData.tgt = JSON.stringify(rollData.tgt);

    if(totalRoll >= defense+10) critique = true;

    if(totalRoll >= defense || critique) {
      rollData.hit = `<p class='green'>${game.i18n.localize(`CNK.ROLL.Hit`)}</p>`;
      hit = true;
    } else rollData.hit = `<p class='red'>${game.i18n.localize(`CNK.ROLL.Fail`)}</p>`;
  }

  let toMerge = {
    tooltip:await roll.getTooltip(),
    result:roll.total,
    stringify:data.stringify,
    rollWButtons:rollWButtons,
    vehicule:data?.vehicule ?? undefined,
    user:data?.user ?? undefined,
  };

  diceRolled.push(roll);

  if(wpn !== undefined) {
    rollData.wpn = wpn;

    if(type !== 'sortilege') {
      const caracDm = dataWpn.system?.caracdm ?? undefined;
      const dgtsKi = dataWpn.system?.degats?.total ?? 0;
      const arcfeu = data?.arcfeu ?? false;
      let formula = `${dataWpn.system.dm}`;
      let listBonus = [];

      if(type === 'wpndistance') {
        let vIncident = dataWpn.system?.incident ?? 0;
        if(arcfeu) vIncident += 1;

        if(total <= vIncident) {
          hit = false;
          rollData.hit = undefined;
          incident = true;
        }
      } else if(type === 'wpnartillerie' && echecCritique.includes(total)) {
        const rollRelance = new Roll(`1D20`);
        await rollRelance.evaluate();
        const totalRelance = rollRelance.dice[0].total;

        rollData.special2 = echecCritique.includes(totalRelance) ? `<span class='fail'>${game.i18n.localize(`CNK.ROLL.Relance`)} : ${totalRelance}</span>` : `<span class="standard">${game.i18n.localize(`CNK.ROLL.Relance`)} : ${totalRelance}</span>`;
        rollData.special3 = echecCritique.includes(totalRelance) ? `<span class='fail'>${game.i18n.localize(`CNK.ROLL.Explosion`)}</span>` : `<span class='critique'>${game.i18n.localize(`CNK.ROLL.PasExplosion`)}</span>`

        if(echecCritique.includes(totalRelance)) explode = true;
        toMerge.triple = {
          tooltip:await rollRelance.getTooltip(),
        };

        diceRolled.push(rollRelance);
      }

      if((tgt !== undefined || type === 'wpngrenade') && hit && !incident) {
        listBonus.push(formula);

        if(caracDm !== undefined && caracDm !== "") {
          const vCarac = actor.system?.caracteristiques?.[caracDm]?.modificateur ?? 0;

          formula += ` + ${vCarac}`;
          listBonus.push(`+${vCarac} ${game.i18n.localize(CONFIG.CNK.CarPossible[caracDm])}`);
        }

        if(dgtsKi !== 0) {
          formula += ` + ${dgtsKi}`;
          listBonus.push(`+${dgtsKi} ${game.i18n.localize(`CNK.DERIVES.Ki`)}`);
        }

        if(arcfeu) {
          formula += ` - 3`;
          listBonus.push(`-3 ${game.i18n.localize(`CNK.ROLL.ArcFeu-short`)}`);
        }

        const rollDgt = new Roll(formula);
        await rollDgt.evaluate();
        let tDgt = rollDgt.total < 1 ? 1 : rollDgt.total;
        let bDgt = undefined;
        let forTxt = 0;
        if(critique && type !== 'wpngrenade') {
          forTxt = tDgt;
          bDgt = `${tDgt}*2`;
          tDgt = tDgt*2;
        }

        let pDgt = {
          flavor:`${game.i18n.localize(`CNK.ROLL.Degats`)}`,
          listBonus:listBonus,
          tooltip:await rollDgt.getTooltip(),
          result:tDgt,
          base:bDgt,
          isDgt:true,
        };

        pDgt.isDgt = true;
        pDgt.isCrit = critique && type !== 'wpngrenade' ? true : false;
        pDgt.baseDgt = forTxt;

        toMerge.second = pDgt;

        diceRolled.push(rollDgt);
      } else if(tgt === undefined && type !== 'wpngrenade' && !incident && ((!echecCritique.includes(total)) ||
        (echecCritique.includes(total) && type === 'wpnartillerie' && explode))) {
        let pDgt = {};

        listBonus.push(formula);

        if(caracDm !== undefined && caracDm !== "") {
          const vCarac = actor.system?.caracteristiques?.[caracDm]?.modificateur ?? 0;

          formula += ` + ${vCarac}`;
          listBonus.push(`+${vCarac} ${game.i18n.localize(CONFIG.CNK.CarPossible[caracDm])}`);
        }

        if(dgtsKi !== 0) {
          formula += ` + ${dgtsKi}`;
          listBonus.push(`+${dgtsKi} ${game.i18n.localize(`CNK.DERIVES.Ki`)}`);
        }

        if(arcfeu) {
          formula += ` - 3`;
          listBonus.push(`-3 ${game.i18n.localize(`CNK.ROLL.ArcFeu-short`)}`);
        }

        const rollDgt = new Roll(formula);
        await rollDgt.evaluate();
        let tDgt = rollDgt.total < 1 ? 1 : rollDgt.total;
        let bDgt = undefined;
        let forTxt = 0;
        if(critique) {
          forTxt = tDgt;
          bDgt = `${tDgt}*2`;
          tDgt = tDgt*2;
        }

        if(echecCritique.includes(total) && type === 'wpnartillerie' && explode) {
          bDgt = `${tDgt}/2`;
          tDgt = tDgt/2 < 1 ? 1 : tDgt/2;
          pDgt.subtitle = game.i18n.localize(`CNK.ROLL.DgtSubisExplosion`);
        }

        pDgt.flavor = `${game.i18n.localize(`CNK.ROLL.Degats`)}`;
        pDgt.listBonus = listBonus;
        pDgt.tooltip = await rollDgt.getTooltip();
        pDgt.result = tDgt;
        pDgt.base = bDgt;
        pDgt.isDgt = true;
        pDgt.isCrit = critique && type !== 'wpngrenade' ? true : false;
        pDgt.baseDgt = forTxt;

        toMerge.second = pDgt;

        diceRolled.push(rollDgt);
      }
    }
  }

  if(critique && !noSpecial) rollData.special = `<span class='critique'>${game.i18n.localize(`CNK.ROLL.Critique`)}</span>`;
  else if(echecCritique.includes(total)) rollData.special = `<span class='fail'>${game.i18n.localize(`CNK.ROLL.EchecCritique`)}</span>`;
  else if(total === 7 && !noSpecial) rollData.special = `<span class='pouce'>${game.i18n.localize(`CNK.ROLL.CoupPouce`)}</span>`;

  if(incident) rollData.special2 = `<span class='fail'>${game.i18n.localize(`CNK.ROLL.Incident`)}</span>`;

  const mergeObject = foundry.utils.mergeObject(rollData, toMerge);

  const rollMsgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      scene: actor?.token?.parent?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rolls:diceRolled,
    content: await renderTemplate(data.template, mergeObject),
    sound: CONFIG.sounds.dice
  };
  const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

  await ChatMessage.create(msgData, {
    rollMode:rMode
  });

  return {
    hit:hit,
    totalDice:total,
    totalRoll:totalRoll,
    echecCritique:echecCritique,
  }
}

export function sendRoll(actor, data={}) {
  const direct = data?.direct ?? false;

  let toStringify = {};
  if(direct) {
    let rollData = data;
    let pRoll = {
      flavor:data?.title ?? "",
      listBonus:data.listBonus,
    };
    rollData.pRoll = pRoll;

    doRoll(actor, rollData);

  } else {
    let d = new Dialog({
      title: data?.title ?? "",
      content: data?.content ?? {},
      buttons: {
       one: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize(`CNK.Jet`),
        callback: async (dataHtml) => {
          const dice = parseInt(dataHtml.find('.dice').val());
          const nbreDice = parseInt(dataHtml.find('.nbreDice').val());
          const listBonus = dataHtml.find('div.bonus');
          const template = data?.rollTemplate ?? 'systems/cthulhu-no-kami/templates/roll/simple.html';
          const rollWButtons = data?.rollWButtons ?? "";
          let list = [];
          let formula = nbreDice > 1 ? `${nbreDice}D${dice}kh + ${data.base}` : `${nbreDice}D${dice} + ${data.base}`;
          let canUseChance = data?.canUseChance ?? false;
          if(dice !== 20) canUseChance = false;

          list.push(`${nbreDice}D${dice} + ${data.base}`);

          for(let i = 0;i < listBonus.length;i++) {
            const tgt = $(listBonus[i]);
            const check = tgt.children('.mod-check').is(':checked');
            const txt = tgt.children('.mod-txt').val();
            const value = tgt.children('.mod-value').val();

            if(check) {
              formula += ` + ${value}`;
              list.push(`+${value} ${txt}`);
            }
          }

          let pRoll = {
            flavor:data?.title ?? "",
            listBonus:list,
          };
          let rollData = {};

          toStringify.title = pRoll.flavor;
          toStringify.formula = formula;
          toStringify.listBonus = list;
          toStringify.template = template;
          toStringify.canUseChance = canUseChance;
          toStringify.rollWButtons = rollWButtons;
          rollData.stringify = JSON.stringify(toStringify);
          rollData.template = template;
          rollData.formula = formula;
          rollData.pRoll = pRoll;
          rollData.rollWButtons = rollWButtons;

          doRoll(actor, rollData);
        }
       },
       two: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize(`CNK.Annuler`)
       }
      },
      default: "one",
      render: rHtml => {
        rHtml.find('.mod-check').click(ev => {
          const target = $(ev.currentTarget);
          const id = target.data('id');
          const value = target.is(':checked');

          rHtml.find(`.mod-id-${id}`).toggleClass('unactive');
        });

        rHtml.find('.addMod').click(ev => {
          const array = d.data.content.bRoll;
          array.push({
            id:array.length,
            active:false,
            name:"Test",
            value:0,
          });
          d.render(true);
        });
      },
    },
    {
      classes:['rollwindow'],
      template: data?.template ? data.template : "systems/cthulhu-no-kami/templates/dialog/rollstd.html",
      height: 400,
    });
    d.render(true);
  }

}

export function sendRollAtk(actor, data={}) {
  const direct = data?.direct ?? false;
  const wpn = data?.wpn ?? undefined;

  let toStringify = {};
  if(direct) {
    let rollData = data;
    let pRoll = {
      flavor:data?.title ?? "",
      listBonus:data.listBonus,
    };
    rollData.pRoll = pRoll;

    doRoll(actor, rollData);

  } else {
    const type = data.content.type;
    let height = 600;
    let classes = ['rollwindow'];
    if(type === 'wpngrenade') classes.push('wpngrenade');
    if(type === 'sortilege') {
      classes.push('sortilege');
      height = 700;
    }

    let d = new Dialog({
      title: data?.title ?? "",
      content: data?.content ?? {},
      buttons: {
       one: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize(`CNK.Jet`),
        callback: async (dataHtml) => {
          const dice = parseInt(dataHtml.find('.dice').val());
          const nbreDice = parseInt(dataHtml.find('.nbreDice').val());
          const listBonus = dataHtml.find('div.bonus');
          const template = data?.rollTemplate ?? 'systems/cthulhu-no-kami/templates/roll/simple.html';
          const arcfeu = d.data.content?.arcfeu ?? false;
          const cible = d.data.content?.cible ?? '10';
          const acouvert = d.data.content?.acouvert ?? false;
          const vehicule = data?.vehicule ?? undefined;
          const user = data?.user ?? undefined;
          let list = [];
          let formula = nbreDice > 1 ? `${nbreDice}D${dice}kh + ${data.base}` : `${nbreDice}D${dice} + ${data.base}`;
          let canUseChance = data?.canUseChance ?? false;
          if(dice !== 20) canUseChance = false;

          list.push(`${nbreDice}D${dice} + ${data.base}`);

          if(wpn !== undefined) {
            const dataWpn = actor.items.get(wpn);
            const attaque = dataWpn.system?.attaque?.total ?? 0;

            if(attaque !== 0) {
              formula += ` + ${attaque}`;
              list.push(`+${attaque} ${dataWpn.name}`);
            }
          }

          if(arcfeu) {
            formula += ` - 3`;
            list.push(`-3 ${game.i18n.localize(`CNK.ROLL.ArcFeu-short`)}`);
          }

          for(let i = 0;i < listBonus.length;i++) {
            const tgt = $(listBonus[i]);
            const check = tgt.children('.mod-check').is(':checked');
            const txt = tgt.children('.mod-txt').val();
            const value = tgt.children('.mod-value').val();

            if(check) {
              formula += ` + ${value}`;
              if(value >= 0) list.push(`+${value} ${txt}`);
              else if(value < 0) list.push(`${value} ${txt}`);
            }
          }

          let pRoll = {
            flavor:data?.title ?? "",
            listBonus:list,
          };
          let rollData = {};

          toStringify.title = pRoll.flavor;
          toStringify.formula = formula;
          toStringify.listBonus = list;
          toStringify.template = template;
          toStringify.canUseChance = canUseChance;
          toStringify.arcfeu = arcfeu;
          toStringify.cible = cible;
          toStringify.acouvert = acouvert;
          toStringify.vehicule = vehicule;
          toStringify.user = user;
          rollData.stringify = JSON.stringify(toStringify);
          rollData.template = template;
          rollData.formula = formula;
          rollData.pRoll = pRoll;
          rollData.tgt = data?.target ?? undefined;
          rollData.wpn = wpn;
          rollData.arcfeu = arcfeu;
          rollData.cible = cible;
          rollData.acouvert = acouvert;
          rollData.vehicule = vehicule;
          rollData.user = user;

          const resultRoll = await doRoll(actor, rollData);

          if(type === 'sortilege') {
            if(resultRoll.hit || resultRoll.echecCritique.includes(resultRoll.totalDice)) {
              const dice2 = parseInt(dataHtml.find('.diceAtt').val());
              const nbreDice2 = parseInt(dataHtml.find('.nbreDiceAtt').val());
              const listBonus2 = dataHtml.find('div.bonus2');
              const template2 = data?.rollTemplate ?? 'systems/cthulhu-no-kami/templates/roll/simple.html';
              let canUseChance2 = data?.canUseChance ?? false;
              let formula2 = nbreDice > 1 ? `${nbreDice2}D${dice2}kh + ${data.base}` : `${nbreDice2}D${dice2} + ${actor.system.combat.magique?.total ?? 0}`;
              let list2 = [];

              if(dice2 !== 20) canUseChance = false;

              list2.push(`${nbreDice}D${dice} + ${actor.system.combat.magique?.total ?? 0}`);
              if(resultRoll.totalDice === 20) {
                formula2 += ` + 5`;
                list2.push(`+5 ${game.i18n.localize(`CNK.ROLL.Critique`)}`);
              }

              for(let i = 0;i < listBonus2.length;i++) {
                const tgt = $(listBonus[i]);
                const check = tgt.children('.mod2-check').is(':checked');
                const txt = tgt.children('.mod2-txt').val();
                const value = tgt.children('.mod2-value').val();

                if(check) {
                  formula2 += ` + ${value}`;
                  if(value >= 0) list2.push(`+${value} ${txt}`);
                  else if(value < 0) list2.push(`${value} ${txt}`);
                }
              }

              let pRollAtt = {
                flavor:data?.title ?? "",
                listBonus:list2
              }
              let toStringifyAtt = {
                title:pRollAtt.flavor,
                formula:formula2,
                listBonus:list2,
                template:template2,
                canUseChance:canUseChance2,
                specialType:true,
                epicFail:resultRoll.echecCritique.includes(resultRoll.totalDice) ? true : false,
              };
              let rollDataAtt = {
                specialType:true,
                stringify:JSON.stringify(toStringifyAtt),
                template:template2,
                formula:formula2,
                pRoll:pRollAtt,
                wpn:wpn,
                epicFail:resultRoll.echecCritique.includes(resultRoll.totalDice) ? true : false,
              };

              doRoll(actor, rollDataAtt);
            }
          }
        }
       },
       two: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize(`CNK.Annuler`)
       }
      },
      default: "one",
      render: rHtml => {
        rHtml.find('.mod-check').click(ev => {
          const target = $(ev.currentTarget);
          const id = target.data('id');
          const value = target.is(':checked');

          rHtml.find(`.mod-id-${id}`).toggleClass('unactive');
        });

        rHtml.find('.mod2-check').click(ev => {
          const target = $(ev.currentTarget);
          const id = target.data('id');
          const value = target.is(':checked');

          rHtml.find(`.mod2-id-${id}`).toggleClass('unactive');
        });

        rHtml.find('button.btnArcFeu').click(ev => {
          const isChecked = d.data.content?.arcfeu ?? false;
          const result = isChecked ? false : true;
          d.data.content.arcfeu = result;
          d.render(true);
        });

        rHtml.find('.addMod').click(ev => {
          const listMod = rHtml.find('div.bonus');
          let array = [];

          for(let i = 0;i < listMod.length;i++) {
            const tgt = $(listMod[i]);
            const check = tgt.children('.mod-check').is(':checked');
            const txt = tgt.children('.mod-txt').val();
            const value = tgt.children('.mod-value').val();

            array.push({
              id:i,
              active:check,
              name:txt,
              value:value
            });
          }

          array.push({
            id:array.length,
            active:false,
            name:game.i18n.localize(`CNK.Modificateur`),
            value:0,
          });

          d.data.content.bRoll = array;
          d.render(true);
        });

        rHtml.find('.addMod2').click(ev => {
          const listMod = rHtml.find('div.bonus2');
          let array = [];

          for(let i = 0;i < listMod.length;i++) {
            const tgt = $(listMod[i]);
            const check = tgt.children('.mod2-check').is(':checked');
            const txt = tgt.children('.mod2-txt').val();
            const value = tgt.children('.mod2-value').val();

            array.push({
              id:i,
              active:check,
              name:txt,
              value:value
            });
          }

          array.push({
            id:array.length,
            active:false,
            name:game.i18n.localize(`CNK.Modificateur`),
            value:0,
          });

          d.data.content.bRoll2 = array;
          d.render(true);
        });

        rHtml.find('button.btnCible10').click(ev => {
          d.data.content.cible = '10';
          d.render(true);
        });

        rHtml.find('button.btnCible15').click(ev => {
          d.data.content.cible = '15';
          d.render(true);
        });

        rHtml.find('button.btnACouvert').click(ev => {
          const vACouvert = d.data.content?.acouvert ?? false;
          d.data.content.acouvert = vACouvert ? false : true;
          d.render(true);
        });
      },
    },
    {
      classes:classes,
      template: data?.template ? data.template : "systems/cthulhu-no-kami/templates/dialog/rollstd.html",
      height: height,
    });
    d.render(true);
  }

}

export function getActorBySpeaker(speaker) {
  const token = speaker.token;
  const scene = speaker.scene;
  const actor = speaker.actor;

  if(scene !== null && token !== null) return game.scenes.get(scene).tokens.get(token).actor;
  else return game.actors.get(actor);
}

export function getChanceValue(actor) {
  let result = 0;
  if(actor === null) result = 0;
  else result = actor?.system?.derives?.chance?.actuel ?? 0;

  return parseInt(result);
}

export function getNumberWpnEquipped(actor) {
  const itm = actor.items.filter(item => CONFIG.CNK.ListWpnCanBeEquipped.includes(item.type) && item.system.equipped !== "");

  return itm.length;
}

export function addButtons(message, html, messageData) {
  const main = $(html).find('.message-content');
  const isDgt = $(html).find('.rollDgt');
  const isRollWButtons = $(html).find('.rollwbuttons');
  const valueDgt = isDgt.length > 0 ? true : false;
  const valueWButtons = isRollWButtons.length > 0 ? true : false;
  const rollButtons = isRollWButtons.data('rollwbuttons');
  const dgt = isDgt.data('dgt');
  const bdgt = isDgt.data('bdgt');
  let isVehicule = isDgt?.data('vehicule') ?? false;
  if(isVehicule !== false) {
    if(game.actors.get(isVehicule) === undefined) isVehicule = false;
  }

  if(valueDgt) {
    main.append(`<div class='blockBtn'></div>`);
    const blockBtn = $(html).find('.blockBtn');
    blockBtn.append(`<button type='action' class="btnCNK applyDgt" title="${game.i18n.localize(`CNK.ROLL.ApplyDgt`)}"><i class="fa-solid fa-location-crosshairs"></i></button>`);

    $(html).find('button.applyDgt').click(ev => {
      const tgt = game.user.targets;
      if(tgt.size > 0) {
        tgt.forEach(async function (token) {
          const rMode = game.settings.get("core", "rollMode");
          const actor = token.document.actor;
          const pv = actor.system.derives.pv.actuel;
          const reduction = actor?.system?.combat?.reduction?.total ?? 0;
          let dgtTotal = Math.max(dgt-reduction, 0);

          if(actor.type === 'vehicule' && !isVehicule) dgtTotal = Math.floor(dgtTotal/2);

          let dgtSubis = dgtTotal === 0 ? `${game.i18n.localize(`CNK.ROLL.NoDegatsSubis`)}` : `${game.i18n.localize(`CNK.ROLL.DegatsSubis`)} : ${dgtTotal}`;
          actor.update({['system.derives.pv.actuel']:Math.max(pv-dgtTotal, 0)});

          const rollMsgData = {
            user: game.user.id,
            speaker: {
              actor: actor?.id || null,
              token: actor?.token?.id || null,
              scene: actor?.token?.parent?.id || null,
              alias: actor?.name || null,
            },
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: await renderTemplate('systems/cthulhu-no-kami/templates/roll/simple.html', {
              flavor:token.name,
              text:`<p style="
              text-align: center;
              font-size: 16px;
              font-variant: small-caps;
              font-weight: bold;
              letter-spacing: 1px;">${dgtSubis}</p>`
            }),
            sound: CONFIG.sounds.dice
          };
          const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

          await ChatMessage.create(msgData, {
            rollMode:rMode
          });
        })
      }
    });

    if(bdgt !== undefined) {
      blockBtn.addClass('col2');
      blockBtn.append(`<button type='action' class="btnCNK applyDgtSimple" title="${game.i18n.localize(`CNK.ROLL.ApplyDgtWCritic`)}"><i class="fa-solid fa-location-crosshairs-slash"></i></button>`);

      $(html).find('button.applyDgtSimple').click(ev => {
        const tgt = game.user.targets;
        if(tgt.size > 0) {
          tgt.forEach(async function (token) {
            const rMode = game.settings.get("core", "rollMode");
            const actor = token.document.actor;
            const pv = actor.system.derives.pv.actuel;
            const reduction = actor.system.combat.reduction.total;
            const dgtTotal = Math.max(bdgt-reduction, 0);
            const dgtSubis = dgtTotal === 0 ? `${game.i18n.localize(`CNK.ROLL.NoDegatsSubis`)}` : `${game.i18n.localize(`CNK.ROLL.DegatsSubis`)} : ${dgtTotal}`;

            actor.update({['system.derives.pv.actuel']:Math.max(pv-dgtTotal, 0)});

            const rollMsgData = {
              user: game.user.id,
              speaker: {
                actor: actor?.id || null,
                token: actor?.token?.id || null,
                scene: actor?.token?.parent?.id || null,
                alias: actor?.name || null,
              },
              type: CONST.CHAT_MESSAGE_TYPES.OTHER,
              content: await renderTemplate('systems/cthulhu-no-kami/templates/roll/simple.html', {
                flavor:token.name,
                text:`<p style="
                text-align: center;
                font-size: 16px;
                font-variant: small-caps;
                font-weight: bold;
                letter-spacing: 1px;">${dgtSubis}</p>`
              }),
              sound: CONFIG.sounds.dice
            };
            const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

            await ChatMessage.create(msgData, {
              rollMode:rMode
            });
          })
        }
      });
    }

  }

  if(valueWButtons) {
    if(rollButtons === 'resistancementale') {
      const actor = getActorBySpeaker(messageData.message.speaker);
      const ownership = actor.ownership?.[messageData.user.id] ?? 0;

      if(messageData.user.isGM || ownership === 3) {
        main.append(`<div class='blockBtn'></div>`);
        const blockBtn = $(html).find('.blockBtn');
        blockBtn.append(`<button type='action' class="btnCNK minusPS" title="${game.i18n.localize(`CNK.ROLL.MinusPS`)}"><i class="fa-regular fa-face-anguished"></i></button>`);

        $(html).find('button.minusPS').click(async ev => {
          const rMode = game.settings.get("core", "rollMode");
          const ps = actor.system.derives.serenite.actuel;
          let update = {};
          update['system.derives.serenite.actuel'] = Math.max(ps-1, 0);
          actor.update(update);

          const rollMsgData = {
            user: game.user.id,
            speaker: {
              actor: actor?.id || null,
              token: actor?.token?.id || null,
              scene: actor?.token?.parent?.id || null,
              alias: actor?.name || null,
            },
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: await renderTemplate('systems/cthulhu-no-kami/templates/roll/simple.html', {
              flavor:actor.name,
              text:`<p style="
              text-align: center;
              font-size: 16px;
              font-variant: small-caps;
              font-weight: bold;
              letter-spacing: 1px;">${game.i18n.localize("CNK.ROLL.PSSubis")} : 1</p>`
            }),
            sound: CONFIG.sounds.dice
          };
          const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

          await ChatMessage.create(msgData, {
            rollMode:rMode
          });
        });
      }
    }
  }
}