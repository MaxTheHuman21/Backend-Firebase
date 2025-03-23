// Conexion a db (data base)
const {Router} = require("express");
const {db} = require("../firebase");

//Notificaciones
const express = require("express");
const admin = require("../firebase");
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const router = Router();

router.get("/", async (req, res) => {
    const querySnapshot = await db.collection("contacts").get()
    
    const contacts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.render('index' , {contacts})

});

//Crear nuevo dato 
router.post('/new-contact', async (req, res) => {
    const {nombre, apellido, email, telefono} = req.body

    await db.collection('contacts').add({
        nombre, 
        apellido, 
        email, 
        telefono
    })

    res.redirect('/')
})

router.get("/edit-contact/:id", async (req, res) => {
    const doc = await db.collection("contacts").doc(req.params.id).get();

    console.log({
        id: doc.id,
        ...doc.data()
    });

    res.send('edit contact')
});

router.get("/delete-contact/:id", async (req, res) => {
    const doc = await db.collection("contacts").doc(req.params.id).delete();
    
    res.redirect('/')
});

router.post("edit-contact/:id", async (req, res) => {
    const doc = await db.collection("contacts").doc(req.params.id).get();
    
    res.render("index", {contact: { id: doc.id, ...doc.data() } })

});

// Endpoint para enviar notificaciones


module.exports = router