export function init() {
	if (game.modules.get("masks-newgeneration-sheets")?.active) {
		if (typeof Babele !== "undefined") {
			Babele.get().register({
				module: "ru-ru",
				lang: "ru",
				dir: "compendium/masks"
			});

			overrideSheet();
		} else {
			new Dialog({
				title: "Перевод библиотек",
				content: `<p>Для перевода библиотек системы МАСКИ требуется установить и активировать модули <b>Babele и libWrapper</b><p>`,
				buttons: {
					done: {
						label: "Хорошо"
					}
				}
			}).render(true);
		}
	}
}

function overrideSheet() {
	Hooks.once("pbtaSheetConfig", () => {
		game.settings.set("pbta", "sheetConfigOverride", true);
		game.pbta.sheetConfig = {
			rollFormula: "2d6",
			statToggle: {
				label: "Locked",
				modifier: 0
			},
			rollResults: {
				failure: {
					start: null,
					end: 6,
					label: "Осложнения..."
				},
				partial: {
					start: 7,
					end: 9,
					label: "Частичный успех"
				},
				success: {
					start: 10,
					end: null,
					label: "Успех!"
				}
			},
			actorTypes: {
				character: {
					stats: {
						danger: {
							label: "Дерзкий",
							value: 0
						},
						freak: {
							label: "Странный",
							value: 0
						},
						savior: {
							label: "Верный",
							value: 0
						},
						superior: {
							label: "Хитрый",
							value: 0
						},
						mundane: {
							label: "Обычный",
							value: 0
						}
					},
					attrTop: {
						heroName: {
							label: "Имя героя",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "Text",
							value: ""
						},
						advances: {
							label: "Продвижения",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "Number",
							value: 0
						},
						xp: {
							label: "Потенциал",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "Xp",
							value: 0,
							max: 5,
							steps: [false, false, false, false, false]
						},
						momentUnlocked: {
							label: "Момент истины",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "Checkbox",
							checkboxLabel: "Unlocked",
							value: false
						}
					},
					attrLeft: {
						conditions: {
							label: "Состояния",
							description: "Выберите все применимые:",
							customLabel: false,
							userLabel: false,
							type: "ListMany",
							condition: true,
							options: {
								0: {
									label: "Afraid (-2 to engage)",
									value: false
								},
								1: {
									label: "Angry (-2 to comfort or pierce)",
									value: false
								},
								2: {
									label: "Guilty (-2 to provoke or assess)",
									value: false
								},
								3: {
									label: "Hopeless (-2 to unleash)",
									value: false
								},
								4: {
									label: "Insecure (-2 to defend or reject)",
									value: false
								}
							}
						},
						look: {
							label: "Внешность",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "LongText",
							value: ""
						},
						abilities: {
							label: "Способности",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "LongText",
							value: ""
						},
						influence: {
							label: "Влияние",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "LongText",
							value: ""
						},
						moment: {
							label: "Момент истины",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "LongText",
							value: ""
						},
						advancements: {
							label: "Продвижения",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "ListMany",
							condition: false,
							options: {
								0: {
									label: "[Text]",
									value: false
								},
								1: {
									label: "[Text]",
									value: false
								}
							}
						}
					},
					moveTypes: {
						basic: {
							label: "Основные ходы",
							moves: []
						},
						playbook: {
							label: "Ходы архетипа",
							moves: []
						},
						team: {
							label: "Ходы команды",
							moves: []
						},
						adult: {
							label: "Ходы взрослого",
							moves: []
						}
					}
				},
				npc: {
					attrTop: {
						realName: {
							label: "Настоящее имя",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "Text",
							value: ""
						}
					},
					attrLeft: {
						conditions: {
							label: "Состояния",
							description: "Выберите все применимые:",
							customLabel: false,
							userLabel: false,
							type: "ListMany",
							condition: false,
							options: {
								0: {
									label: "Напуган",
									value: false
								},
								1: {
									label: "Зол",
									value: false
								},
								2: {
									label: "Виноват",
									value: false
								},
								3: {
									label: "Отчаян",
									value: false
								},
								4: {
									label: "Неуверен",
									value: false
								}
							}
						},
						drive: {
							label: "Мотивация",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "LongText",
							value: ""
						},
						abilities: {
							label: "Способности",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "LongText",
							value: ""
						},
						generation: {
							label: "Поколение",
							description: null,
							customLabel: false,
							userLabel: false,
							type: "Text",
							value: ""
						}
					},
					moveTypes: {
						villain: {
							label: "Ходы злодея",
							moves: []
						},
						condition: {
							label: "Ходы состояния",
							moves: []
						}
					}
				}
			}
		};
	});
}
