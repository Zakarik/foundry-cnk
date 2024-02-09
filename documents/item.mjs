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

        this._prepareWpnWearData(itemData);
        this._prepareWpnUsedData(itemData);
        this._prepareAllWpnData(itemData);
        this._prepareVoieData(itemData);
        this._prepareProfil(itemData);
    }

    _prepareWpnWearData(itemData) {
        if (itemData.type === 'wpncontact' || itemData.type === 'wpndistance' || itemData.type === 'wpngrenade') {
            const system = itemData.system;
            const utilisation = system?.utilisation ?? "";
            const equipped = system?.equipped ?? "";

            if(utilisation === '1main' && equipped === '2mains') system.equipped = '1main';
            if(utilisation === '1mainou2mains') {
                if(equipped === '1main') system.dm = system.dm1 === "" ? "1D6" : system.dm1;
                else if(equipped === '2mains') system.dm = system.dm2 === "" ? "1D6" : system.dm2;
            }

            if(system.dm === "") system.dm = "1D6";
        }
    }

    _prepareWpnUsedData(itemData) {
        if (itemData.type === 'wpnartillerie') {
            const system = itemData.system;

            system.dm = system.dm === "" ? "1D6" : system.dm;
        }
    }

    _prepareAllWpnData(itemData) {
        if (itemData.type === 'wpncontact' || itemData.type === 'wpndistance' || itemData.type === 'wpngrenade' || itemData.type === 'wpnartillerie') {
            if(itemData.isOwned) {
                const actor = itemData.parent;
                let actData = actor.system;
                if(actor.type === 'vehicule') {
                    const pilote = actData?.listpilote ?? [];

                    if(pilote.length > 0) {
                        const getPilote = game.actors.get(pilote[0]);
                        actData = getPilote?.system ?? {};
                    }
                }

                const actKi = actData?.derives?.ki?.actuel;
                const ki = parseInt(actKi);
                const data = itemData.system;
                const attaque = data.attaque;
                const degats = data.degats;
                let totalAtt = 0;
                let totalDgt = 0;
                let attKi = 0;
                let dgtKi = 0;

                if(attaque.kipositif && ki > 0) attKi += ki;
                if(attaque.kinegatif && ki < 0) attKi += ki;

                if(degats.kipositif && ki > 0) dgtKi += ki;
                if(degats.kinegatif && ki < 0) dgtKi += ki;

                totalAtt += attKi;
                totalAtt += attaque.base;

                totalDgt += dgtKi;
                totalDgt += degats.base;

                attaque.ki = attKi;
                attaque.total = totalAtt;
                degats.ki = dgtKi;
                degats.total = totalDgt;
            }
        }
    }

    _prepareVoieData(itemData) {
        if(itemData.type === 'voie') {
            const system = itemData.system;
            const listrangs = system.listrang;

            for(let r in listrangs) {
                const rang = listrangs[r];
                const listmodjet = rang.modjet?.list ?? {};

                for(let m in listmodjet) {
                    const modjet = listmodjet[m];
                    const selonrang = modjet?.selonrang ?? false;

                    if(selonrang) {
                        modjet.value = 0;
                    }
                }
            }
        }
    }

    _prepareProfil(itemData) {
        if(itemData.type === 'profil') {
            const system = itemData.system;
            const listvoie = system?.voie ?? {};

            for(let v in listvoie) {
                const voie = listvoie[v].system;
                const listrangs = voie?.listrang;
                const filter = Object.entries(listrangs).filter(itm => itm[1].selected);
                const maxFilter = filter.length !== 0 ? Math.max(...Object.keys(filter).map(key => parseInt(key))) : undefined;
                const maxRang = maxFilter !== undefined ? filter[maxFilter][0] : 0;

                for(let r in listrangs) {
                    const rang = listrangs[r];
                    const listmodjet = rang.modjet?.list ?? {};

                    if(rang.selected) {
                        for(let m in listmodjet) {
                            const modjet = listmodjet[m];
                            const selonrang = modjet?.selonrang ?? false;

                            if(selonrang) {
                                if(itemData.isOwned) {
                                    const rawvalue = modjet?.rawvalue ?? 0;

                                    modjet.value = rawvalue*parseInt(maxRang.replace('rang', ''));
                                } else {
                                    modjet.value = 0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}