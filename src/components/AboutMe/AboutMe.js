import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './AboutMe.css';

function AboutMe() {
  const sectionRef = useRef(null);

  // Track scroll progress for parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"]
  });
  
  // AboutMe content floats UP from below as you scroll
  const contentY = useTransform(scrollYProgress, [0, 1], ["30%", "0%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.5, 1]);
  
  // Background overlay fades in to cover the background image
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [0, 0.95, 1]);

  return (
    <section 
      ref={sectionRef}
      className="about-section"
    >
      <motion.div 
        className="about-overlay"
        style={{ opacity: overlayOpacity }}
      ></motion.div>
      <motion.div 
        className="about-container"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <h2 className="about-title">
          Über mich
        </h2>
        
        <div className="about-content">
          <div className="about-block">
            <h3 className="about-subtitle">Mit 40+ den Bass lernen – warum eigentlich nicht?</h3>
            <p>
              Hallo! Ich bin [Dein Name], leidenschaftlicher Neuling am Bass und überzeugtes Beispiel dafür, 
              dass es nie zu spät ist, etwas Neues zu beginnen.
            </p>
            <p>
              Mit über 40 habe ich beschlossen, meinen alten Traum endlich wahr zu machen: Bass spielen lernen.
            </p>
            <p>
              Kein großer Plan, keine musikalische Ausbildung – nur Neugier, Spaß und die Lust, zu sehen, 
              wohin die Reise führt.
            </p>
            <p>
              Was als spontaner Gedanke begann, hat sich zu einem echten Herzensprojekt entwickelt. 
              Ich teile meine Erfahrungen offen – mit viel Selbstironie, kleinen Rückschlägen und großen 
              Erfolgsmomenten. Denn: Wenn man mit 40+ das erste Mal eine Basslinie richtig durchzieht, 
              fühlt sich das an wie ein kleiner Rockstar-Moment!
            </p>
          </div>

          <div className="about-block">
            <h3 className="about-subtitle">Musik und ADHS – eine besondere Verbindung</h3>
            <p>
              Ein wichtiger Teil meiner Geschichte ist mein Umgang mit ADHS.
            </p>
            <p>
              Musik hat für mich etwas unglaublich Ausgleichendes. Sie hilft mir, Konzentration und Emotionen 
              in Einklang zu bringen – und gibt mir gleichzeitig Raum für Kreativität.
            </p>
            <p>
              Beim Basslernen stoße ich natürlich auch auf typische ADHS-Herausforderungen: Geduld, Fokus, Struktur. 
              Aber genau das macht die Reise spannend. Ich zeige ehrlich, wie ich mit diesen Themen umgehe, 
              welche Lernmethoden funktionieren – und dass man auch mit ADHS seinen eigenen Rhythmus finden kann.
            </p>
            <p>
              Musik ist für mich mehr als ein Hobby. Sie ist Therapie, Ausdruck, Struktur und Freiheit zugleich. 
              Wenn ich damit andere motiviere, selbst zu einem Instrument zu greifen, hat sich das alles schon gelohnt.
            </p>
          </div>

          <div className="about-block">
            <h3 className="about-subtitle">Was dich auf meiner Webseite erwartet</h3>
            <p>
              Auf dieser Webseite begleite ich dich auf meiner musikalischen Reise und möchte dir Mut machen, 
              selbst loszulegen.
            </p>
            <p>Hier findest du:</p>
            <ul className="about-list">
              <li>🎸 Ehrliche Einblicke in meinen Lernprozess,</li>
              <li>🧠 Interaktive Lernhilfen, die dir den Einstieg ins Bassspielen erleichtern,</li>
              <li>😂 Selbstironische Geschichten und Outtakes, die zeigen, dass Lernen Spaß machen darf,</li>
              <li>🎤 und bald auch Interviews mit erfahrenen Musiker:innen, die ihre Sicht auf das Bassspiel teilen.</li>
            </ul>
            <p>
              Ich möchte verstehen – und zeigen –, was das Bassspielen im Erwachsenenalter so faszinierend macht. 
              Und natürlich: dass Musik einfach Freude bringt, egal, wie alt man ist oder wo man gerade steht.
            </p>
          </div>

          <div className="about-block">
            <h3 className="about-subtitle">Warum ich das alles mache</h3>
            <p>
              Ich bin kein Profi, kein Virtuose – und genau das ist der Punkt.
            </p>
            <p>
              Ich will zeigen, dass Leidenschaft wichtiger ist als Perfektion. Dass man auch mit 40+ oder mit ADHS 
              Neues lernen kann. Und dass Musik helfen kann, sich selbst ein Stück besser kennenzulernen.
            </p>
            <p>
              Wenn du also selbst schon länger mit dem Gedanken spielst, ein Instrument zu lernen, aber glaubst, 
              es wäre „zu spät" – lass dir das Gegenteil beweisen!
            </p>
            <p>
              Begleite mich auf meiner Reise, finde hier Inspiration und Werkzeuge für deinen eigenen Start – 
              und nimm vielleicht selbst mal den Bass in die Hand.
            </p>
            <p className="about-closing">
              Denn am Ende zählt nur eins:<br />
              <strong>Musik kennt kein Alter – nur Begeisterung.</strong>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default AboutMe;
