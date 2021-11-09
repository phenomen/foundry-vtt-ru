# Common Decorative Styles (CDS)

CDS is a CSS library with the most commonly used utilities and components. It allows developers to rapidly style their layouts with easy human-readable classes without writing a single line of CSS.

## 1. Installation
There are few ways of using CDS in your module or system.

### 1.1 Module Dependancy (Recommended)
Add `lib-cds` as an module dependancy to your `module.json` or `system.json`.

```json
	"dependencies": [{
		"name": "lib-cds"
	}],
```

### 1.2 CSS Import
Add the following string to the top of style file in your module or system:
```css
@import "[...]";
```
**Not recommended** since other modules or system may already include CDS as a dependancy module and it will just load redundant styles.

### 1.3 Standalone Module
If you're not a developer but want to apply CDS styles to Journals and other places that allow HTML, you may install and enable `lib-cds` module in your world.

## 2. Utilities

### 2.1 Spacing

#### 2.1.1 Padding

#### 2.1.2 Padding Y

#### 2.1.3 Padding X

#### 2.1.4 Padding Top

#### 2.1.5 Padding Left

#### 2.1.6 Padding Bottom

#### 2.1.7 Padding Right

#### 2.1.8 Margin

#### 2.1.9 Margin Y

#### 2.1.10 Margin X

#### 2.1.11 Margin Top

#### 2.1.12 Margin Left

#### 2.1.13 Margin Bottom

#### 2.1.14 Margin Right

#### 2.1.15 Space Between Y

#### 2.1.16 Space Between X

### 2.2 Sizing

#### 2.2.1 Width

#### 2.2.2 Min-Width

#### 2.2.3 Max-Width

#### 2.2.4 Height

#### 2.2.5 Min-Height

#### 2.2.6 Max-Height

### 2.3 Flex

### 2.4 Positioning

### 2.5 Table

