import React from "react";
import { motion } from "framer-motion";
import "./UnitCard.css";
import { FaHeart, FaBolt, FaShieldAlt, FaRunning, FaFortAwesome } from "react-icons/fa";

export interface Unit {
    name: string;
    tier: number;
    type: string;
    skills: string[];
    health: number;
    minDamage: number;
    maxDamage: number;
    defense: number;
    movement: number;
    cost: number;
    requiredTechnology: string;
    upgrade: string;
    faction: string;
    FactionType: string;
    imageUrl?: string;
}

interface UnitCardProps {
    unit: Unit;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit }) => {
    return (
        <motion.div
            className="cardContainer"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            whileHover={{
                scale: 1.18,
                y: -6,
                boxShadow: "0px 20px 40px rgba(0,0,0,0.6), 0 0 15px rgba(255,127,50,0.2)",
                transition: { type: "spring", stiffness: 120, damping: 18 },
            }}
        >
            {/* Header */}
            <div className="header">
                <div className="name">{unit.name}</div>
                <div className="fortIcon"><FaFortAwesome /></div>
            </div>

            {/* Type + Tier */}
            <div className="typeTier">
                <span className="type">{unit.type}</span>
                <span className="tierBadge">Tier {unit.tier}</span>
            </div>

            {/* Art */}
            <div className="artContainer">
                <img src={unit.imageUrl} alt={unit.name} />
            </div>

            {/* Glow Overlay */}
            <motion.div
                className="cardGlowOverlay"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            />

            {/* Stats */}
            <div className="statsBox">
                <div className="statsRow">
                    <div className="stat"><FaHeart /> {unit.health}</div>
                    <div className="stat"><FaBolt /> {unit.minDamage} - {unit.maxDamage}</div>
                </div>
                <div className="statsRow">
                    <div className="stat"><FaShieldAlt /> {unit.defense}</div>
                    <div className="stat"><FaRunning /> {unit.movement}</div>
                    <div className="stat">Cost: {unit.cost}</div>
                </div>
            </div>

            {/* Skills */}
            <div className="skills">
                {unit.skills.map((skill, idx) => (
                    <span key={idx} className="skill">{skill}</span>
                ))}
            </div>
        </motion.div>
    );
};
