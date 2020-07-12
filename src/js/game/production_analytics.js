import { GameRoot } from "./root";
import { ShapeDefinition } from "./shape_definition";
import { globalConfig } from "../core/config";
import { BaseItem, enumItemType } from "./base_item";
import { ShapeItem } from "./items/shape_item";
import { BasicSerializableObject } from "../savegame/serialization";

/** @enum {string} */
export const enumAnalyticsDataSource = {
    produced: "produced",
    stored: "stored",
    delivered: "delivered",
    deliveredToStorage: "deliveredToStorage",
};

export class ProductionAnalytics extends BasicSerializableObject {
    static getId() {
        return "ProductionAnalytics";
    }

    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        super();
        this.root = root;

        this.history = {
            [enumAnalyticsDataSource.produced]: [],
            [enumAnalyticsDataSource.stored]: [],
            [enumAnalyticsDataSource.delivered]: [],
            [enumAnalyticsDataSource.deliveredToStorage]: [],
        };

        for (let i = 0; i < globalConfig.statisticsGraphSlices; ++i) {
            this.startNewSlice();
        }

        this.root.signals.shapeDelivered.add(this.onShapeDelivered, this);
        this.root.signals.itemProduced.add(this.onItemProduced, this);
        this.root.signals.itemDeliveredToStorage.add(this.onItemDeliveredToStorage, this);

        this.lastAnalyticsSlice = 0;
    }

    /**
     * @param {ShapeDefinition} definition
     */
    onShapeDelivered(definition) {
        const key = definition.getHash();
        const entry = this.history[enumAnalyticsDataSource.delivered];
        entry[entry.length - 1][key] = (entry[entry.length - 1][key] || 0) + 1;
    }

    /**
     * @param {BaseItem} item
     */
    onItemProduced(item) {
        if (item.getItemType() === enumItemType.shape) {
            const definition = /** @type {ShapeItem} */ (item).definition;
            const key = definition.getHash();
            const entry = this.history[enumAnalyticsDataSource.produced];
            entry[entry.length - 1][key] = (entry[entry.length - 1][key] || 0) + 1;
        }
    }

    /**
     * @param {number} uid
     * @param {number} count
     */
    onItemDeliveredToStorage(uid, count) {
        const key = uid.toString();
        const entry = this.history[enumAnalyticsDataSource.deliveredToStorage];
        entry[entry.length - 1][key] = (entry[entry.length - 1][key] || 0) + count;
    }

    /**
     * Starts a new time slice
     */
    startNewSlice() {
        for (const key in this.history) {
            if (key === enumAnalyticsDataSource.stored) {
                // Copy stored data
                this.history[key].push(Object.assign({}, this.root.hubGoals.storedShapes));
            } else {
                this.history[key].push({});
            }
            while (this.history[key].length > globalConfig.statisticsGraphSlices) {
                this.history[key].shift();
            }
        }
    }

    /**
     * Returns the current rate of a given shape
     * @param {enumAnalyticsDataSource} dataSource
     * @param {string} shapeKey
     */
    getCurrentShapeRate(dataSource, shapeKey) {
        const slices = this.history[dataSource];
        return slices[slices.length - 2][shapeKey] || 0;
    }

    /**
     * Returns the rate of a given shape, <historyOffset> frames ago
     * @param {enumAnalyticsDataSource} dataSource
     * @param {string} shapeKey
     * @param {number} historyOffset
     */
    getPastShapeRate(dataSource, shapeKey, historyOffset) {
        assertAlways(
            historyOffset >= 0 && historyOffset < globalConfig.statisticsGraphSlices - 1,
            "Invalid slice offset: " + historyOffset
        );

        const slices = this.history[dataSource];
        return slices[slices.length - 2 - historyOffset][shapeKey] || 0;
    }

    /**
     * Returns the rates of all shapes
     * @param {enumAnalyticsDataSource} dataSource
     */
    getCurrentShapeRates(dataSource) {
        const slices = this.history[dataSource];

        // First, copy current slice
        const baseValues = Object.assign({}, slices[slices.length - 2]);

        // Add past values
        for (let i = 0; i < 10; ++i) {
            const pastValues = slices[slices.length - i - 3];
            for (const key in pastValues) {
                baseValues[key] = baseValues[key] || 0;
            }
        }

        return baseValues;
    }

    update() {
        if (this.root.time.now() - this.lastAnalyticsSlice > globalConfig.analyticsSliceDurationSeconds) {
            this.lastAnalyticsSlice = this.root.time.now();
            this.startNewSlice();
        }
    }
}
