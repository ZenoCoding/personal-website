package com.team9470.subsystems.intake;

import com.ctre.phoenix6.controls.MotionMagicVoltage;
import com.ctre.phoenix6.hardware.TalonFX;
import com.team254.lib.drivers.TalonFXFactory;
import com.team254.lib.drivers.TalonUtil;
import com.team9470.Ports;
import edu.wpi.first.units.measure.Angle;
import edu.wpi.first.wpilibj.DigitalInput;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.Commands;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

import static edu.wpi.first.units.Units.Degrees;
import static edu.wpi.first.units.Units.Volts;

/**
 * Solution for the intake subsystem lesson.
 * Rename this file and class to Intake before adding it to the robot project.
 */
public class IntakeLessonSolution extends SubsystemBase {
    private final TalonFX armMotor;
    private final TalonFX rollerMotor;
    private final DigitalInput coralSensor = new DigitalInput(Ports.INTAKE_BREAK);

    private final MotionMagicVoltage motionMagic = new MotionMagicVoltage(0);

    private Angle targetAngle = IntakeConstants.RETRACTED_ANGLE;
    private boolean rollersRunning;

    public IntakeLessonSolution() {
        armMotor = TalonFXFactory.createDefaultTalon(Ports.INTAKE_ARM);
        rollerMotor = TalonFXFactory.createDefaultTalon(Ports.INTAKE_ROLLERS);

        TalonUtil.applyAndCheckConfiguration(armMotor, IntakeConstants.getArmConfig());
        TalonUtil.applyAndCheckConfiguration(rollerMotor, IntakeConstants.getRollerConfig());
    }

    @Override
    public void periodic() {
        armMotor.setControl(motionMagic.withPosition(targetAngle).withSlot(0));

        SmartDashboard.putNumber("Intake/Position", getAngle().in(Degrees));
        SmartDashboard.putNumber("Intake/Goal_Deg", targetAngle.in(Degrees));
        SmartDashboard.putBoolean("Intake/Has_Coral", hasCoral());
        SmartDashboard.putBoolean("Intake/Rollers_Running", rollersRunning);
    }

    public Angle getAngle() {
        return armMotor.getPosition().getValue();
    }

    public boolean hasCoral() {
        return !coralSensor.get();
    }

    public void setTargetAngle(Angle angle) {
        targetAngle = angle;
    }

    public void startRollers() {
        rollerMotor.setVoltage(IntakeConstants.ROLLER_SPEED.in(Volts));
        rollersRunning = true;
    }

    public void stopRollers() {
        rollerMotor.stopMotor();
        rollersRunning = false;
    }

    public void reverseRollers() {
        rollerMotor.setVoltage(IntakeConstants.ROLLER_REVERSE_SPEED.in(Volts));
        rollersRunning = true;
    }

    public boolean areRollersRunning() {
        return rollersRunning;
    }

    public void deploy() {
        setTargetAngle(IntakeConstants.DOWN_ANGLE);
        startRollers();
    }

    public void stow() {
        setTargetAngle(IntakeConstants.RETRACTED_ANGLE);
        stopRollers();
    }

    public Command getMoveToAngleCommand(Angle angle) {
        return runOnce(() -> setTargetAngle(angle))
                .andThen(Commands.waitUntil(
                        () -> Math.abs(
                                getAngle().in(Degrees) - angle.in(Degrees)) <= 2.0));
    }

    public Command autoIntakeCommand() {
        return runOnce(this::deploy)
                .andThen(Commands.waitUntil(this::hasCoral))
                .andThen(runOnce(this::stow))
                .finallyDo(interrupted -> stopRollers());
    }
}
