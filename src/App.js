import React, { useState, useEffect } from 'react';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import './App.css'

const MAX_ATTRIBUTE_POINTS = 70;

const App = () => {

  const [selectedSkill, setSelectedSkill] = useState(SKILL_LIST[0].name); //Select 1st Skill as default 
  const [skillCheckDC, setSkillCheckDC] = useState(10); //Default value of DC

  const [selectedClass, setSelectedClass] = useState(null);
  const [clickeddClass, setClickedClass] = useState(Object.keys(CLASS_LIST)[0]);
  const [attributes, setAttributes] = useState({});

  const [totalSkillPoints, setTotalSkillPoints] = useState(0);
  const [initialSkillPoints, setExtraSkillPoints] = useState({}); 

  const [skillCheckResult, setSkillCheckResult] = useState(null);

  const [showClassRequirements, setShowClassRequirements] = useState(false);
 
  //Set the default data from 1st character class in list
  useEffect(() => {
    setSelectedClass(Object.keys(CLASS_LIST)[0]);
  }, []);

  //Set the attributes for that class
  useEffect(() => {
    if (selectedClass != null) {
      setAttributes(CLASS_LIST[selectedClass]);
    }
  }, [selectedClass]);

  //Set initial skills on load to 0
  useEffect(() => {
    
    SKILL_LIST.forEach((skill) => {
      initialSkillPoints[skill.name] = 0;
    });
    
    setExtraSkillPoints(initialSkillPoints);
  }, []);

  // Update skill when Intelligence changes
  useEffect(() => {
      const intelligenceModifier = calculateModifier(attributes.Intelligence || 10);
      setTotalSkillPoints(10 + (4 * intelligenceModifier));
    }, [attributes.Intelligence]);

  // Calculate modifier based on attribute
  const calculateModifier = (attr) => Math.floor((attr - 10) / 2);
  
  // Calculate total attribute points
  const calculateTotalPoints = (newAttributes) => {
    return Object.values(newAttributes).reduce((a, b) => a + b, 0);
  };
  
  //Check if minimum requirements for class is satisfied
  const checkMinimunClassRequirements = (className) =>{
    let meetsMinimum = true;
    const classRequirements = CLASS_LIST[className];

    for (let key in classRequirements) {
      if (attributes[key] < classRequirements[key]) {
        meetsMinimum = false;
      }
    }
  
    return meetsMinimum;
  }

  // Perform skill check based on attributes and skill modifier
  const performSkillCheck = () => {
    const skill = SKILL_LIST.find((s) => s.name === selectedSkill);
    const skillPoints= initialSkillPoints[skill.name]+calculateModifier(attributes[skill.attributeModifier])
    const diceRoll = Math.floor(Math.random() * 20) + 1;
    const result = diceRoll + skillPoints;
    const isSuccessful = result >= skillCheckDC;
    setSkillCheckResult({
      skillPoints,
      skill: selectedSkill,
      diceRoll,
      dc: skillCheckDC,
      success: isSuccessful,
    });
  };

  //Modify attribute changes
  const handleAttributeChange = (attr, value) => {
    const parsedValue = Math.max(1, Math.min(parseInt(value) || 9, 20));
    const newAttributes = { ...attributes, [attr]: parsedValue };
    const newTotal = calculateTotalPoints(newAttributes);

    if (newTotal > MAX_ATTRIBUTE_POINTS) {
      alert('A character can have max up to 70 delegated points');
    } else {
      setAttributes(newAttributes);
    }
  };

  //Modifying skill changes 

  const increaseSkill = (skillName, increasedValue) => {
    const newSkills = {...initialSkillPoints, [skillName]: increasedValue}
    if (calculateTotalPoints(newSkills)<= totalSkillPoints) {
      setExtraSkillPoints(newSkills);
    }
  };

  const decreaseSkill = (skillName, decreasedValue) => {
    const newSkills = {...initialSkillPoints, [skillName]: decreasedValue}
    if (calculateTotalPoints(newSkills)<= totalSkillPoints) {
      setExtraSkillPoints(newSkills);
    }
  };

  //Update class req changes
  const toggleClassRequirements = () => {
    setShowClassRequirements(!showClassRequirements);
  };

  return (
    <div>
       <h1>Character Sheet</h1>
        <div className="container">
          <h1>React Coding Exercise - Character Sheet</h1>

          <div className="panel">
            <h3>Skill Check
              <p></p>
              <button>Save Character</button>
            </h3>
            <div className="skill-check">
              <p>Character:
                {selectedClass}</p>
              Skill: <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
                {SKILL_LIST.map((skill) => (
                  <option key={skill.name} value={skill.name}>
                    {skill.name}
                  </option>
                ))}
              </select>
              DC:<input
                type="number"
                placeholder="DC"
                value={skillCheckDC}
                onChange={(e) => setSkillCheckDC(e.target.value)}
              />
              <button onClick={performSkillCheck}>Roll</button>
            </div>
            {skillCheckResult && (
              <div className="skill-results">
                <h3>Skill Check Results</h3>
                <p>Skill: {skillCheckResult.skill}:{skillCheckResult.skillPoints}</p>
                <p>You Rolled: {skillCheckResult.diceRoll}</p>
                <p>The DC was: {skillCheckResult.dc}</p>
                <p>Result: {skillCheckResult.success ? 'Successful' : 'Failed'}</p>
              </div>
            )}
          </div>

          <div className="panel">
            <h3>Attributes</h3>
            {ATTRIBUTE_LIST.map((attr) => (
              <div key={attr} className="attribute-modifier">
                <label>
                  {attr}: {attributes[attr]} (Modifier: {calculateModifier(attributes[attr])})
                </label>
                <div>
                  <button onClick={() => handleAttributeChange(attr, attributes[attr] + 1)}>+</button>
                  <button onClick={() => handleAttributeChange(attr, attributes[attr] - 1)}>-</button>
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <h3>Classes</h3>
            <div className="class-selector">
              {Object.keys(CLASS_LIST).map((className) => (
                <button
                  key={className}
                  className={checkMinimunClassRequirements(className) === true ? 'active' : ''}
                  onClick={() => setClickedClass(className)}
                >
                  {className}
                </button>
              ))}

              <button onClick={toggleClassRequirements}>
                {showClassRequirements ? 'Hide Requirements' : 'Show Requirements'}
              </button>

              {showClassRequirements && (
                <div className="class-requirements">
                  <h4>{clickeddClass} Minimum Requirements</h4>
                  {Object.keys(CLASS_LIST[clickeddClass]).map((attr) => (
                    <p key={attr}>
                      {attr}: {CLASS_LIST[clickeddClass][attr]}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
 
          <div className="panel">
            <h3>Skills</h3>
            <p>Total skill points available: {totalSkillPoints}</p>
            {SKILL_LIST.map((skill) => (
              <div key={skill.name} className="skill-modifier">
                <label>
                  {skill.name}: {initialSkillPoints[skill.name]} (Modifier: {skill.attributeModifier}): {calculateModifier(attributes[skill.attributeModifier])}
                </label>
                <div>
                  <button onClick={() => increaseSkill(skill.name, initialSkillPoints[skill.name] + 1)}>+</button>
                  <button onClick={() => decreaseSkill(skill.name, initialSkillPoints[skill.name] - 1)}>-</button>
                  total: {initialSkillPoints[skill.name] + calculateModifier(attributes[skill.attributeModifier])}
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}; 

export default App;
