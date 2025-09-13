import dotenv from "dotenv";
dotenv.config();
import { User } from "../models/user.model.js";
import { BadRequestError } from "../core/error.response.js";
import userController from "./user.controller.js";
import { checkUserLoggedIn, checkUserActivated } from "../utils/util.js";
import { BloodStock } from "../models/bloodStock.model.js";
import { Hospital } from "../models/hospital.model.js";

class PageController {
    signIn = async (req, res) => {
        const mockUser = {
            name: "Hello",
        };
        res.render("signIn", mockUser);
    };
    landingPage = async (req, res) => {
        const accessToken = req.cookies.accessToken; // Assuming you store the accessToken in cookies
        const user = await checkUserLoggedIn(accessToken);
        const mockData = {
            totalCustomers: 1000,
            yearsExperience: 10,
            totalDestinations: 50,
            averageRating: 4.5,
            popularDestinations: [
                { name: "Hanoi", image: "/images/hanoi.jpg" },
                { name: "Ho Chi Minh City", image: "/images/hcmc.jpg" },
                { name: "Da Nang", image: "/images/danang.jpg" },
            ],
            user: user || null, // <— always defined (null or object)
        };
        res.render("landingPage", mockData);
    };

    bloodRecords = async (req, res) => {
        try {
            const accessToken = req.cookies.accessToken;
            const user = await checkUserLoggedIn(accessToken);

            const { bloodType, productType, status, location } = req.query;

            const filtersApplied =
                bloodType || productType || status || location;
            if (!filtersApplied) {
                return res.render("bloodRecords", {
                    user: user || null,
                    results: [],
                    filters: { bloodType, productType, status, location },
                });
            }

            // Base query: only filter by hospital and top-level fields
            let stocks = await BloodStock.find()
                .populate("hospitalId", "name city region address")
                .lean();

            // Apply hospital location filter
            if (location) {
                stocks = stocks.filter((s) =>
                    s.hospitalId?.city
                        ?.toLowerCase()
                        .includes(location.toLowerCase())
                );
            }

            // 🔑 Filter inside each inventory array
            stocks = stocks.map((s) => {
                let filteredInventory = s.inventory;

                if (bloodType) {
                    filteredInventory = filteredInventory.filter(
                        (i) => i.bloodType === bloodType
                    );
                }
                if (productType) {
                    filteredInventory = filteredInventory.filter(
                        (i) => i.productType === productType
                    );
                }
                if (status) {
                    filteredInventory = filteredInventory.filter(
                        (i) => i.status === status
                    );
                }

                return { ...s, inventory: filteredInventory };
            });

            // Remove hospitals with no matching inventory
            stocks = stocks.filter((s) => s.inventory.length > 0);

            // 🔀 Shuffle randomly
            stocks = stocks.sort(() => Math.random() - 0.5);

            res.render("bloodRecords", {
                user: user || null,
                results: stocks,
                filters: { bloodType, productType, status, location },
            });
        } catch (err) {
            console.error("❌ Error fetching blood records:", err);
            res.status(500).send("Server Error");
        }
    };

    sendRequest = async (req, res) => {
        const accessToken = req.cookies.accessToken; // Assuming you store the accessToken in cookies
        const user = await checkUserLoggedIn(accessToken);
        console.log(user);
        res.render("sendRequest", { user: user || null });
    };
    confirm = async (req, res) => {
        const accessToken = req.cookies.accessToken; // Assuming you store the accessToken in cookies
        const user = await checkUserLoggedIn(accessToken);
        console.log(user);
        res.render("confirm", { user: user || null });
    };
}

export default new PageController();
