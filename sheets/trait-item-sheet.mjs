import {
  addHTMLModJet,
  prepareModJet,
  addHTMLMod,
  prepareMod
} from "../module/helpers/common.mjs";

/**
 * @extends {ItemSheet}
 */
export class TraitItemSheet extends ItemSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cnk", "sheet", "item", "trait"],
      template: "systems/cthulhu-no-kami/templates/trait-item-sheet.html",
      width: 700,
      height: 450,
      scrollY: [".attributes"],
      tabs: [
        {navSelector: ".tabs", contentSelector: ".body", initial: "modificateurs"}
      ],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    prepareMod(context.item);
    prepareModJet(context.item);

    context.systemData = context.data.system;

    console.warn(context);

    return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    addHTMLMod(html, this.item);
    addHTMLModJet(html, this.item, this.item.system, 'system.modjet');
  }
}