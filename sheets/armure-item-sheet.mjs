import {
  addHTMLMod,
  prepareMod
} from "../module/helpers/common.mjs";

/**
 * @extends {ItemSheet}
 */
export class ArmureItemSheet extends ItemSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cnk", "sheet", "item", "armure"],
      template: "systems/cthulhu-no-kami/templates/armure-item-sheet.html",
      width: 700,
      height: 550,
      scrollY: [".attributes"],
      tabs: [{navSelector: ".tabs", contentSelector: ".body", initial: "base"}]
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    prepareMod(context.item);

    context.systemData = context.data.system;

    return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    addHTMLMod(html, this.item, true);
  }
}