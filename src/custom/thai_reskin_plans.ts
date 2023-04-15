import { Plan } from "../plan";
import { createPlans } from "../plans";

const plansToRemove = ["Vault"];

export const thaiReskinPlans = [...createPlans()]
  .filter((p) => !plansToRemove.includes(p.name))
  .map((originalPlan) => {
    const p = { ...originalPlan };
    switch (p.name) {
      case "Windmill":
        p.name = "Pee Beach";
        break;

      case "Museum":
        p.name = "Google Photos Album";
        break;

      case "Gallery":
        p.name = "ATV Adventure";
        break;

      case "Bridge":
        p.name = "Speedboat Dock";
        break;

      case "Statue":
        p.name = "Waterfall 1";
        break;

      case "Gardens":
        p.name = "Waterfall 2";
        break;

      case "Co-op":
        p.name = "ATM (220 Baht fee)";
        break;

      case "Corporate HQ":
        p.name = "Weed Shop";
        break;

      case "Stripmine":
        p.name = "Strip n Pool";
        break;

      case "Plant":
        p.name = "Crispy Catfish Farm";
        break;

      case "Mine":
        p.name = "Carbonara Mine";
        break;

      case "Workshop":
        p.name = "Custom Plate with Pic Factory";
        break;

      case "Factory":
        p.name = "Manao Factory";
        break;

      case "Landfill":
        p.name = "Ryan's Villa";
        break;

      case "Obelisk":
        p.name = "Margo's Wang";
        break;

      default:
        break;
    }
    return p;
  });
