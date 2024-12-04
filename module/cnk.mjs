
// Import document classes.
import { CNKActor } from "../documents/actor.mjs";
import { CNKItem } from "../documents/item.mjs";

// Import sheet classes.
import { EiyuActorSheet } from "../sheets/eiyu-actor-sheet.mjs";
import { VehiculeActorSheet } from "../sheets/vehicule-actor-sheet.mjs";
import { EntiteActorSheet } from "../sheets/entite-actor-sheet.mjs";
import { ProfilItemSheet } from "../sheets/profil-item-sheet.mjs";
import { TraitItemSheet } from "../sheets/trait-item-sheet.mjs";
import { MentalItemSheet } from "../sheets/mental-item-sheet.mjs";
import { WpnItemSheet } from "../sheets/wpn-item-sheet.mjs";
import { SortilegeItemSheet } from "../sheets/sortilege-item-sheet.mjs";
import { ArmureItemSheet } from "../sheets/armure-item-sheet.mjs";
import { ObjetItemSheet } from "../sheets/objet-item-sheet.mjs";
import { VoieItemSheet } from "../sheets/voie-item-sheet.mjs";
import { CapaciteItemSheet } from "../sheets/capacite-item-sheet.mjs";

//UTILITY
import { RegisterHandlebars } from "./handlebars.mjs";
import { PreloadTemplates } from "./templates.mjs";
import { RegisterSettings } from "./settings.mjs";

//HELPERS
import { CNK } from "./helpers/config.mjs";
import {
  getActorBySpeaker,
  getChanceValue,
  sendRoll,
  addButtons,
} from "./helpers/common.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.cnk = {
    applications: {
      EiyuActorSheet,
      VehiculeActorSheet,
      EntiteActorSheet,
      ProfilItemSheet,
      TraitItemSheet,
      MentalItemSheet,
      WpnItemSheet,
      SortilegeItemSheet,
      ArmureItemSheet,
      ObjetItemSheet,
      VoieItemSheet,
      CapaciteItemSheet,
    },
    documents:{
      CNKActor,
      CNKItem
    },
  };

  // Add custom constants for configuration.
  CONFIG.CNK = CNK;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@combat.initiative.total",
    decimals: 2
  };
  // Define custom Document classes
  CONFIG.Actor.documentClass = CNKActor;
  CONFIG.Item.documentClass = CNKItem;

  // SETTINGS
  RegisterSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);

  Actors.registerSheet("cthulhu-no-kami", EiyuActorSheet, {
    types: ["eiyu"],
    makeDefault: true
  });

  Actors.registerSheet("cthulhu-no-kami", VehiculeActorSheet, {
    types: ["vehicule"],
    makeDefault: true
  });

  Actors.registerSheet("cthulhu-no-kami", EntiteActorSheet, {
    types: ["entite"],
    makeDefault: true
  });

  Items.registerSheet("cthulhu-no-kami", ProfilItemSheet, {
    types: ["profil"],
    makeDefault: true
  });

  Items.registerSheet("cthulhu-no-kami", TraitItemSheet, {
    types: ["avantage", "desavantage"],
    makeDefault: true
  });

  Items.registerSheet("cthulhu-no-kami", MentalItemSheet, {
    types: ["phobie", "folie"],
    makeDefault: true
  });

  Items.registerSheet("cthulhu-no-kami", WpnItemSheet, {
    types: ["wpncontact", "wpndistance", "wpngrenade", "wpnartillerie"],
    makeDefault: true
  });

  Items.registerSheet("cthulhu-no-kami", SortilegeItemSheet, {
    types: ["sortilege"],
    makeDefault: true
  });

  Items.registerSheet("cthulhu-no-kami", ArmureItemSheet, {
    types: ["armure"],
    makeDefault: true
  });

  Items.registerSheet("cthulhu-no-kami", ObjetItemSheet, {
    types: ["objet"],
    makeDefault: true
  });

  Items.registerSheet("cthulhu-no-kami", VoieItemSheet, {
    types: ["voie"],
    makeDefault: true
  });

  Items.registerSheet("cthulhu-no-kami", CapaciteItemSheet, {
    types: ["capacite"],
    makeDefault: true
  });

  CONFIG.statusEffects = [{
    id:'dead',
    label:'EFFECT.StatusDead',
    icon:'icons/svg/skull.svg'
  },
  {
    id:'blind',
    label:'CNK.STATUS.Aveugle',
    icon:"icons/svg/blind.svg",
    changes:[{
      key:'system.combat.initiative.other',
      mode:2,
      value:-5
    },
    {
      key:'system.combat.contact.other',
      mode:2,
      value:-5
    },
    {
      key:'system.combat.defense.other',
      mode:2,
      value:-5
    },
    {
      key:'system.combat.distance.other',
      mode:2,
      value:-10
    }]
  },
  {
    id:'affaibli',
    label:'CNK.STATUS.Affaibli',
    icon:"icons/svg/downgrade.svg",
    changes:[{
      key:'system.roll.modDice',
      mode:5,
      value:12
    }]
  },
  {
    id:'etourdi',
    label:'CNK.STATUS.Etourdi',
    icon:"icons/svg/daze.svg",
    changes:[{
      key:'system.combat.defense.other',
      mode:2,
      value:-5
    }]
  },
  {
    id:'immobilise',
    label:'CNK.STATUS.Immobilise',
    icon:"icons/svg/net.svg",
    changes:[{
      key:'system.roll.modDice',
      mode:5,
      value:12
    }]
  },
  {
    id:'paralyse',
    label:'CNK.STATUS.Paralyse',
    icon:"icons/svg/paralysis.svg"
  },
  {
    id:'ralenti',
    label:'CNK.STATUS.Ralenti',
    icon:"systems/cthulhu-no-kami/assets/icons/etats/ralenti.svg"
  },
  {
    id:'renverse',
    label:'CNK.STATUS.Renverse',
    icon:"icons/svg/falling.svg",
    changes:[{
      key:'system.combat.contact.other',
      mode:2,
      value:-5
    },
    {
      key:'system.combat.distance.other',
      mode:2,
      value:-5
    },
    {
      key:'system.combat.magique.other',
      mode:2,
      value:-5
    },
    {
      key:'system.combat.defense.other',
      mode:2,
      value:-5
    }]
  },
  {
    id:'surpris',
    label:'CNK.STATUS.Surpris',
    icon:"systems/cthulhu-no-kami/assets/icons/etats/surpris.svg",
    changes:[{
      key:'system.combat.defense.other',
      mode:2,
      value:-5
    }]
  }];

  // HANDLEBARS
  RegisterHandlebars();

  // TEMPLATES
  PreloadTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  Hooks.on("hotbarDrop", (bar, data, slot) => createMacro(bar, data, slot));
});

Hooks.on("renderChatMessage", function(message, html, messageData) {
  const isInitiative = message.getFlag('core', 'initiativeRoll');
  const menu = [
    {
      name: "CHAT.PopoutMessage",
      icon: '<i class="fas fa-external-link-alt fa-rotate-180"></i>',
      condition: li => {
        const message = game.messages.get(li.data("messageId"));
        return message.getFlag("core", "canPopout") === true;
      },
      callback: li => {
        const message = game.messages.get(li.data("messageId"));
        new ChatPopout(message).render(true);
      }
    },
    {
      name: "CHAT.RevealMessage",
      icon: '<i class="fas fa-eye"></i>',
      condition: li => {
        const message = game.messages.get(li.data("messageId"));
        const isLimited = message.whisper.length || message.blind;
        return isLimited && (game.user.isGM || message.isAuthor) && message.isContentVisible;
      },
      callback: li => {
        const message = game.messages.get(li.data("messageId"));
        return message.update({whisper: [], blind: false});
      }
    },
    {
      name: "CHAT.ConcealMessage",
      icon: '<i class="fas fa-eye-slash"></i>',
      condition: li => {
        const message = game.messages.get(li.data("messageId"));
        const isLimited = message.whisper.length || message.blind;
        return !isLimited && (game.user.isGM || message.isAuthor) && message.isContentVisible;
      },
      callback: li => {
        const message = game.messages.get(li.data("messageId"));
        return message.update({whisper: ChatMessage.getWhisperRecipients("gm").map(u => u.id), blind: false});
      }
    },
    {
      name: "SIDEBAR.Delete",
      icon: '<i class="fas fa-trash"></i>',
      condition: li => {
        const message = game.messages.get(li.data("messageId"));
        return message.canUserModify(game.user, "delete");
      },
      callback: li => {
        const message = game.messages.get(li.data("messageId"));
        return message.delete();
      }
    },
    {
      name: "CNK.CONTEXTMENU.RelancePtsChance",
      icon: '<i class="fa-solid fa-dice-d20"></i>',
      condition: li => {
        const message = game.messages.get(li.data("messageId"));
        const canModify = message.canUserModify(game.user, "delete");
        let result = false;
        if(canModify) {
          const data = $(message.content).data('stringified');
          const actor = getActorBySpeaker(message.speaker);
          if(actor === undefined) return false;
          const user = actor.type === 'vehicule' ? game.actors.get(data.user) : undefined;
          const chance = actor.type === 'vehicule' ? getChanceValue(user) : getChanceValue(actor);
          const canUseChance = data?.canUseChance ?? false;
          result = message.isRoll && actor !== null && chance > 0 && canUseChance ? true : false;
        }

        return result;
      },
      callback: li => {
        const message = game.messages.get(li.data("messageId"));
        const msg = $(message.content);
        const data = msg.data('stringified');
        const tgt = msg?.data('tgt') ?? undefined;
        const wpn = msg?.data('wpn') ?? undefined;
        const actor = getActorBySpeaker(message.speaker);
        const user = actor.type === 'vehicule' ? game.actors.get(data.user) : undefined;
        const chance = actor.type === 'vehicule' ? getChanceValue(user) : getChanceValue(actor);
        data.canUseChance = false;
        let rollData = {
          direct:true,
          formula:data.formula,
          title:`${game.i18n.localize(`CNK.ROLL.Relance`)} : ${data.title}`,
          template:data.template,
          stringify:JSON.stringify(data),
          listBonus:data.listBonus,
          rollWButtons:data?.rollWButtons ?? "",
          specialType:data?.specialType ?? false,
          epicFail:data?.epicFail ?? false,
          vehicule:data?.vehicule ?? undefined,
          user:data?.user ?? undefined,
        };
        if(tgt !== undefined && tgt !== "") {
          rollData.tgt = {
            actorId:tgt.actor,
            _id:tgt.tgt,
            parent:{
              _id:tgt.scene
            }
          }
        }
        if(wpn !== undefined && wpn !== "") {
          rollData.wpn = wpn;
          rollData.arcfeu = data.arcfeu;
          rollData.cible = data.cible;
          rollData.acouvert = data.acouvert;
        }

        actor.update({['system.derives.chance.actuel']:chance-1});

        sendRoll(actor, rollData);
      }
    }
  ];

  new ContextMenu(html, '.chat-message', menu);

  if(isInitiative) {
    $(html).find('div.message-content div.dice-roll').addClass('cnk-roll-simple');
    $(html).find('div.message-content div.dice-roll h4.dice-total').addClass('result');
    $(html).find('div.message-content div.dice-roll div.dice-formula').addClass('block');
    $(html).find('div.message-content div.dice-roll div.dice-formula').removeClass('dice-formula');
    $(html).find('div.message-content div.dice-roll div.dice-result div.block').before(`<h4 class="dice-total flavor title">${game.i18n.localize(`CNK.COMBAT.Initiative`)}</h4`);
    $(html).find('span.flavor-text').remove();
  }

  addButtons(message, html, messageData);
});