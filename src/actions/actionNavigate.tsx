import { getClientColors, getClientInitials } from "../clients";
import { Avatar } from "../components/Avatar";
import { centerScrollOn } from "../scene/scroll";
import { Collaborator } from "../types";
import { register } from "./register";

export const actionGoToCollaborator = register({
  name: "goToCollaborator",
  trackEvent: { category: "collab" },
  perform: (_elements, appState, value) => {
    const point = value as Collaborator["pointer"];
    if (!point) {
      return { appState, commitToHistory: false };
    }

    return {
      appState: {
        ...appState,
        ...centerScrollOn({
          scenePoint: point,
          viewportDimensions: {
            width: appState.width,
            height: appState.height,
          },
          zoom: appState.zoom,
        }),
        // Close mobile menu
        openMenu: appState.openMenu === "canvas" ? null : appState.openMenu,
      },
      commitToHistory: false,
    };
  },
  PanelComponent: ({ appState, updateData, data }) => {
    const clientId: string | undefined = data?.id;
    if (!clientId) {
      return null;
    }

    const collaborator = appState.collaborators.get(clientId);

    if (!collaborator) {
      return null;
    }

    const { background, stroke } = getClientColors(
      collaborator.picture || clientId,
      appState,
    );
    const picture = collaborator.picture;

    const shortName = getClientInitials(collaborator.username);

    return (
      <Avatar
        color={background}
        border={picture ? "transparent" : stroke}
        onClick={() => updateData(collaborator.pointer)}
      >
        {picture ? (
          <img referrerPolicy="no-referrer" src={picture} alt={shortName} />
        ) : (
          shortName
        )}
      </Avatar>
    );
  },
});
