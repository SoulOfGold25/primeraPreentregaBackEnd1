import { Router } from "express";
import { passportCall, authorization } from '../utils.js';


const router = Router();



router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/register", (req, res) => {
    res.render("register");
});


// Perfil de User
router.get("/",
    passportCall('jwt'),
    (req, res) => {
        res.render("profile", {
            user: req.user //->Habilitar para JWT
        });
    });


// Perfil del ADMIN
router.get("/dashboard-admin",
    passportCall('jwt'),
    authorization("admin"),
    (req, res) => {
        res.render("admin", {
            user: req.user //->Habilitar para JWT
        });
    });

    router.get("/purchase/success", (req, res) => {
        const ticket = req.session.ticket;
        const noStock = req.session.noStock || [];
      
        if (!ticket) return res.redirect("/");
      
        res.render("purchase-success", { ticket, noStock });
      
        // Limpiar datos temporales
        req.session.ticket = null;
        req.session.noStock = null;
      });
      


export default router