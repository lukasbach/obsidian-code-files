import CodeFilesPlugin from "./codeFilesPlugin";

export const mountCodeEditor = (
	plugin: CodeFilesPlugin,
	language: string,
	initialValue: string,
	codeContext: string,
	onChange?: () => void
) => {
	let value = initialValue;
	const theme = (app as any).getTheme() === "obsidian" ? "vs-dark" : "vs";

	const queryParameters = new URLSearchParams();
	queryParameters.append("context", codeContext);
	queryParameters.append("lang", language);
	queryParameters.append("theme", theme);
	queryParameters.append("background", "transparent");
	queryParameters.append(
		"folding",
		plugin.settings.folding ? "true" : "false"
	);
	queryParameters.append(
		"lineNumbers",
		plugin.settings.lineNumbers ? "on" : "off"
	);
	queryParameters.append(
		"minimap",
		plugin.settings.minimap ? "true" : "false"
	);
	queryParameters.append("javascriptDefaults", "true");
	queryParameters.append("typescriptDefaults", "true");
	queryParameters.append(
		"javascriptDefaultsNoSemanticValidation",
		!plugin.settings.semanticValidation ? "true" : "false"
	);
	queryParameters.append(
		"typescriptDefaultsNoSemanticValidation",
		!plugin.settings.semanticValidation ? "true" : "false"
	);
	queryParameters.append(
		"javascriptDefaultsNoSyntaxValidation",
		!plugin.settings.syntaxValidation ? "true" : "false"
	);
	queryParameters.append(
		"typescriptDefaultsNoSyntaxValidation",
		!plugin.settings.syntaxValidation ? "true" : "false"
	);

	const iframe: HTMLIFrameElement = document.createElement("iframe");
	iframe.src = `https://embeddable-monaco.lukasbach.com?${queryParameters.toString()}`;
	iframe.style.width = "100%";
	iframe.style.height = "100%";

	const send = (type: string, payload: any) => {
		iframe?.contentWindow?.postMessage(
			{
				type,
				...payload,
			},
			"*"
		);
	};

	window.addEventListener("message", ({ data }) => {
		switch (data.type) {
			case "ready": {
				send("change-value", { value });
				send("change-language", {
					language,
				});
				send("change-background", {
					background: "transparent",
					theme,
				});
				break;
			}
			case "change": {
				if (data.context === codeContext) {
					// console.log("!change event", data.value, data.context);
					value = data.value;
					onChange?.();
				} else {
					// console.log("!change event", data.value, data.context, "ignored!!!!!!!!!!!!");
				}
				// this.requestSave();
				break;
			}
			default:
				break;
		}
	});

	const clear = () => {
		send("change-value", { value: "" });
		value = "";
	};

	const setValue = (newValue: string) => {
		value = newValue;
		send("change-value", { value: newValue });
	};

	const getValue = () => value;

	const destroy = () => {
		iframe.remove();
	};

	return {
		iframe,
		send,
		clear,
		getValue,
		setValue,
		destroy,
	};
};
