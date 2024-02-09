/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const PreloadTemplates = async function() {

    const path = `systems/cthulhu-no-kami/templates`;

    // Define template paths to load
    const templatePaths = [
      `${path}/eiyu-limited-sheet.html`,
      `${path}/vehicule-limited-sheet.html`,
      `${path}/parts/identite.html`,
      `${path}/parts/caracteristiques.html`,
      `${path}/parts/derives.html`,
      `${path}/parts/caracteristiques-vehicule.html`,
      `${path}/parts/derives-vehicule.html`,
      `${path}/parts/combatStates.html`,
      `${path}/parts/traits.html`,
      `${path}/parts/mental.html`,
      `${path}/parts/combat.html`,
      `${path}/parts/inventaire.html`,
      `${path}/parts/voies.html`,
      `${path}/parts/passagers.html`,
      `${path}/parts/presentation.html`,
      `${path}/parts/headerItmStd.html`,
      `${path}/parts/modificateurs.html`,
      `${path}/parts/modjet.html`,
      `${path}/parts/subparts/data.html`,
      `${path}/parts/subparts/wpncontact.html`,
      `${path}/parts/subparts/wpndistance.html`,
      `${path}/parts/subparts/wpngrenade.html`,
      `${path}/parts/subparts/wpnartillerie.html`,
      `${path}/parts/subparts/sortilege.html`,
      `${path}/roll/simple.html`,
      `${path}/chat/sendlvl.html`,
      `${path}/chat/sendmsg.html`,
      `${path}/dialog/rollstd.html`,
      `${path}/creator/caracteristiques.html`,
      `${path}/creator/profil.html`,
      `${path}/creator/traits.html`,
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
  };