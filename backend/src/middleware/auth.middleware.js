import jwt from 'jsonwebtoken';
import { ENV } from '../lib/env.js';
import User from '../models/User.js';
import crypto from 'crypto';

export const protectRoute = async (req , res , next) =>{
    try {
        const authHeader = req.headers.authorization;
        
        // 1. Check for API Key
        if (authHeader && authHeader.startsWith('Bearer chat_live_')) {
            const rawKey = authHeader.split(' ')[1];
            const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
            
            const user = await User.findOne({ apiKey: hashedKey }).select("-password");
            if (!user) return res.status(401).json({ message: "Unauthorized - Invalid API Key" });
            
            req.user = user;
            return next();
        }

        // 2. Check for JWT Cookie
        const token = req.cookies.jwt;
        if(!token) return res.status(401).json({message:"Unauthorized - No token provided"});

        const decode = jwt.verify(token , ENV.JWT_SECRET);
        if(!decode ) return res.status(401).json({message:"Unauthorized - Invalid token provided"});

        const user = await User.findById(decode.userId).select("-password");
        if(!user) return res.status(404).json({message : "User not Found"});

         
        req.user = user; 
        next();
    } catch (error) {
        console.log("ERROR in protectRoute middleware : ", error ) ;
        res.status(500).json({message : "Internal server error"});
    } 
};
