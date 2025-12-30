package com.team9470.subsystems.intake;

import com.ctre.phoenix6.controls.MotionMagicVoltage;
import com.ctre.phoenix6.hardware.TalonFX;
import com.team254.lib.drivers.TalonFXFactory;
import com.team254.lib.drivers.TalonUtil;
import com.team9470.Ports;
import edu.wpi.first.units.measure.*;
import edu.wpi.first.wpilibj.DigitalInput;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

import static edu.wpi.first.units.Units.*;

/**
 * Intake Subsystem Skeleton
 * 
 * YOUR TASK: Implement the missing methods marked with TODO.
 * Refer to the lesson guide for help!
 */
public class IntakeSkeleton extends SubsystemBase {

    // ═══════════════════════════════════════════════════════════════════════
    // HARDWARE - Motors and sensors
    // ═══════════════════════════════════════════════════════════════════════
    private final TalonFX armMotor;
    private final TalonFX rollerMotor;
    private final DigitalInput coralSensor = new DigitalInput(Ports.INTAKE_BREAK);

    // ═══════════════════════════════════════════════════════════════════════
    // CONTROL REQUESTS - Reusable control objects
    // ═══════════════════════════════════════════════════════════════════════
    private final MotionMagicVoltage motionMagic = new MotionMagicVoltage(0);

    // ═══════════════════════════════════════════════════════════════════════
    // STATE - Track what the subsystem is doing
    // ═══════════════════════════════════════════════════════════════════════
    private Angle targetAngle = IntakeConstants.RETRACTED_ANGLE;
    private boolean rollersRunning = false;

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════
    public IntakeSkeleton() {
        // TODO: Create the motor instances using TalonFXFactory
        armMotor = null; // Replace with actual initialization
        rollerMotor = null; // Replace with actual initialization

        // TODO: Apply motor configurations using TalonUtil
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PERIODIC - Runs every 20ms (50Hz)
    // ═══════════════════════════════════════════════════════════════════════
    @Override
    public void periodic() {
        // TODO: Apply the motion magic control to move arm to targetAngle

        // TODO: Log telemetry to SmartDashboard
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SENSOR GETTERS - Read values from hardware
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Get the current arm angle from the motor encoder.
     * 
     * @return Current arm position as an Angle
     */
    public Angle getAngle() {
        // TODO: Return the position from armMotor
        return Degrees.of(0);
    }

    /**
     * Check if the coral sensor detects a game piece.
     * Note: The sensor returns false when the beam is broken!
     * 
     * @return true if coral is detected
     */
    public boolean hasCoral() {
        // TODO: Return the inverted sensor value
        return false;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ARM CONTROL - Move the arm
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Set the desired angle for the arm to move to.
     * The actual movement happens in periodic().
     * 
     * @param angle Target angle for the arm
     */
    public void setTargetAngle(Angle angle) {
        // TODO: Store the target angle
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ROLLER CONTROL - Spin the intake rollers
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Start the intake rollers to pull in game pieces.
     */
    public void startRollers() {
        // TODO: Set roller motor voltage and update rollersRunning state
    }

    /**
     * Stop the intake rollers.
     */
    public void stopRollers() {
        // TODO: Stop the roller motor and update rollersRunning state
    }

    /**
     * Reverse the rollers to eject game pieces.
     */
    public void reverseRollers() {
        // TODO: Set roller motor to reverse voltage
    }

    public boolean areRollersRunning() {
        return rollersRunning;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COMPOUND ACTIONS - Combine multiple operations
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Deploy the intake: move arm down and start rollers.
     */
    public void deploy() {
        // TODO: Set target angle to DOWN_ANGLE and start rollers
    }

    /**
     * Stow the intake: retract arm and stop rollers.
     */
    public void stow() {
        // TODO: Set target angle to RETRACTED_ANGLE and stop rollers
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COMMANDS - Return Command objects for the command scheduler
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Returns a command that moves the arm to the specified angle.
     * The command finishes when the arm is within 2 degrees of the target.
     */
    public Command getMoveToAngleCommand(Angle angle) {
        // TODO: Create a command that:
        // 1. Sets the target angle
        // 2. Waits until the arm reaches the target (within 2 degrees)
        return null;
    }

    /**
     * Returns a command that deploys the intake, waits for coral,
     * then automatically stows.
     */
    public Command autoIntakeCommand() {
        // TODO: Chain commands to:
        // 1. Deploy the intake
        // 2. Wait until coral is detected
        // 3. Stow the intake
        return null;
    }
}
