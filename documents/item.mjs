import { setBaseImg } from "../module/helpers/common.mjs";
/**
 * Extend the base Item document to support attributes and groups with a custom template creation dialog.
 * @extends {Item}
 */
export class CNKItem extends Item {
    static async create(data, options = {}) {
        // Replace default image
        if (data.img === undefined) data.img = setBaseImg(data.type);

        await super.create(data, options);
    }

    prepareDerivedData() {
        const itemData = this;
    }
}